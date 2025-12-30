"""
GraphQL Client for schema introspection and analysis.
"""

import json
from typing import Any, Dict, List, Optional, Union

import httpx


class GraphQLClient:
    """Client for performing GraphQL introspection queries."""
    
    def __init__(self, endpoint: str, auth_header: str = "Authorization", auth_value: str = "", schema_file: Optional[str] = None):
        self.endpoint = endpoint
        self.auth_header = auth_header
        self.auth_value = auth_value
        self.schema_file = schema_file
        self._schema_cache: Optional[Dict[str, Any]] = None
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for GraphQL requests."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if self.auth_value:
            headers[self.auth_header] = self.auth_value
        return headers
    
    async def _execute_query(self, query: str, variables: Optional[Dict[str, Any]] = None, operation_name: Optional[str] = None) -> Dict[str, Any]:
        """Execute a GraphQL query and return the response."""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        if operation_name:
            payload["operationName"] = operation_name
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.endpoint,
                json=payload,
                headers=self._get_headers(),
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                error_messages = [error.get("message", str(error)) for error in result["errors"]]
                raise Exception(f"GraphQL errors: {', '.join(error_messages)}")
            
            return result.get("data", {})
    
    async def _get_schema(self) -> Dict[str, Any]:
        """Get the full schema via introspection or local file (with caching)."""
        if self._schema_cache is not None:
            return self._schema_cache
        
        # Try to load from local file first (for performance and size limits)
        if self.schema_file:
            try:
                import json
                import os
                
                if os.path.exists(self.schema_file):
                    with open(self.schema_file, 'r') as f:
                        if self.schema_file.endswith('.json'):
                            # Load introspection JSON
                            introspection_result = json.load(f)
                            if 'data' in introspection_result and '__schema' in introspection_result['data']:
                                self._schema_cache = introspection_result['data']['__schema']
                                return self._schema_cache
                        elif self.schema_file.endswith('.graphql'):
                            # Parse GraphQL SDL file
                            from graphql import build_schema, get_introspection_query, graphql_sync
                            
                            schema_sdl = f.read()
                            schema = build_schema(schema_sdl)
                            introspection_query = get_introspection_query()
                            result = graphql_sync(schema, introspection_query)
                            
                            if result.data and '__schema' in result.data:
                                self._schema_cache = result.data['__schema']
                                return self._schema_cache
            except Exception as e:
                print(f"Warning: Could not load schema from file {self.schema_file}: {e}")
                print("Falling back to live introspection...")
        
        # Fallback to live introspection
        introspection_query = """
        query IntrospectionQuery {
          __schema {
            queryType { name }
            mutationType { name }
            subscriptionType { name }
            types {
              ...FullType
            }
            directives {
              name
              description
              locations
              args {
                ...InputValue
              }
            }
          }
        }
        
        fragment FullType on __Type {
          kind
          name
          description
          fields(includeDeprecated: true) {
            name
            description
            args {
              ...InputValue
            }
            type {
              ...TypeRef
            }
            isDeprecated
            deprecationReason
          }
          inputFields {
            ...InputValue
          }
          interfaces {
            ...TypeRef
          }
          enumValues(includeDeprecated: true) {
            name
            description
            isDeprecated
            deprecationReason
          }
          possibleTypes {
            ...TypeRef
          }
        }
        
        fragment InputValue on __InputValue {
          name
          description
          type { ...TypeRef }
          defaultValue
        }
        
        fragment TypeRef on __Type {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """
        
        result = await self._execute_query(introspection_query)
        self._schema_cache = result.get("__schema", {})
        return self._schema_cache
    
    def _format_type_ref(self, type_ref: Dict[str, Any]) -> str:
        """Format a type reference into a readable string."""
        if not type_ref:
            return "Unknown"
        
        kind = type_ref.get("kind")
        name = type_ref.get("name")
        of_type = type_ref.get("ofType")
        
        if kind == "NON_NULL":
            return f"{self._format_type_ref(of_type)}!"
        elif kind == "LIST":
            return f"[{self._format_type_ref(of_type)}]"
        elif name:
            return name
        else:
            return "Unknown"
    
    async def introspect_schema(self, page: int = 1, per_page: int = 20, filter_kind: Optional[str] = None) -> str:
        """Get schema introspection with pagination to handle large schemas."""
        try:
            from .tools.pagination import paginate_schema_types, format_pagination_info
            
            schema = await self._get_schema()
            
            output = ["# GraphQL Schema Introspection\n"]
            
            # Root types
            if schema.get("queryType"):
                output.append(f"**Query Type:** {schema['queryType']['name']}")
            if schema.get("mutationType"):
                output.append(f"**Mutation Type:** {schema['mutationType']['name']}")
            if schema.get("subscriptionType"):
                output.append(f"**Subscription Type:** {schema['subscriptionType']['name']}")
            
            output.append("")
            
            # Types with pagination
            types = schema.get("types", [])
            paginated_types, pagination_info = paginate_schema_types(types, page, per_page, filter_kind)
            
            # Overall summary
            user_types = [t for t in types if not t.get("name", "").startswith("__")]
            by_kind = {}
            for type_info in user_types:
                kind = type_info.get("kind", "UNKNOWN")
                by_kind[kind] = by_kind.get(kind, 0) + 1
            
            output.append("## Schema Summary")
            output.append(f"**Total Types:** {len(user_types)}")
            for kind, count in sorted(by_kind.items()):
                output.append(f"- **{kind}:** {count} types")
            
            output.append("")
            
            # Pagination info
            output.append("## Types")
            output.append(format_pagination_info(pagination_info))
            output.append("")
            
            # Current page types
            if filter_kind:
                output.append(f"### {filter_kind} Types")
            else:
                output.append("### All Types")
            
            for type_info in paginated_types:
                name = type_info.get("name", "")
                kind = type_info.get("kind", "")
                desc = type_info.get("description", "")
                
                type_line = f"**{name}** ({kind})"
                if desc:
                    type_line += f" - {desc}"
                output.append(type_line)
            
            if not paginated_types:
                output.append("No types found for the current page/filter.")
            
            return "\n".join(output)
            
        except Exception as e:
            return f"Error introspecting schema: {str(e)}"
    
    async def get_type_info(self, type_name: str) -> str:
        """Get detailed information about a specific type."""
        try:
            schema = await self._get_schema()
            types = schema.get("types", [])
            
            type_info = next((t for t in types if t.get("name") == type_name), None)
            if not type_info:
                return f"Type '{type_name}' not found in schema"
            
            output = [f"# Type: {type_name}\n"]
            
            # Basic info
            output.append(f"**Kind:** {type_info.get('kind', 'Unknown')}")
            if type_info.get("description"):
                output.append(f"**Description:** {type_info['description']}")
            
            # Fields (for OBJECT and INTERFACE types)
            if type_info.get("fields"):
                output.append("\n## Fields")
                for field in type_info["fields"]:
                    field_name = field.get("name", "")
                    field_type = self._format_type_ref(field.get("type", {}))
                    field_desc = field.get("description", "")
                    
                    output.append(f"### {field_name}: {field_type}")
                    if field_desc:
                        output.append(f"*{field_desc}*")
                    
                    # Arguments
                    if field.get("args"):
                        output.append("**Arguments:**")
                        for arg in field["args"]:
                            arg_name = arg.get("name", "")
                            arg_type = self._format_type_ref(arg.get("type", {}))
                            arg_desc = arg.get("description", "")
                            arg_default = arg.get("defaultValue")
                            
                            arg_text = f"- {arg_name}: {arg_type}"
                            if arg_default:
                                arg_text += f" = {arg_default}"
                            if arg_desc:
                                arg_text += f" - {arg_desc}"
                            output.append(arg_text)
                    
                    if field.get("isDeprecated"):
                        reason = field.get("deprecationReason", "No reason provided")
                        output.append(f"**⚠️ Deprecated:** {reason}")
                    
                    output.append("")
            
            # Input fields (for INPUT types)
            if type_info.get("inputFields"):
                output.append("\n## Input Fields")
                for field in type_info["inputFields"]:
                    field_name = field.get("name", "")
                    field_type = self._format_type_ref(field.get("type", {}))
                    field_desc = field.get("description", "")
                    default_value = field.get("defaultValue")
                    
                    field_text = f"- **{field_name}**: {field_type}"
                    if default_value:
                        field_text += f" = {default_value}"
                    if field_desc:
                        field_text += f" - {field_desc}"
                    output.append(field_text)
            
            # Enum values
            if type_info.get("enumValues"):
                output.append("\n## Enum Values")
                for value in type_info["enumValues"]:
                    value_name = value.get("name", "")
                    value_desc = value.get("description", "")
                    
                    value_text = f"- **{value_name}**"
                    if value_desc:
                        value_text += f" - {value_desc}"
                    output.append(value_text)
                    
                    if value.get("isDeprecated"):
                        reason = value.get("deprecationReason", "No reason provided")
                        output.append(f"  ⚠️ Deprecated: {reason}")
            
            # Interfaces
            if type_info.get("interfaces"):
                output.append("\n## Implements Interfaces")
                for interface in type_info["interfaces"]:
                    output.append(f"- {interface.get('name', 'Unknown')}")
            
            # Possible types (for UNION and INTERFACE)
            if type_info.get("possibleTypes"):
                output.append("\n## Possible Types")
                for possible_type in type_info["possibleTypes"]:
                    output.append(f"- {possible_type.get('name', 'Unknown')}")
            
            return "\n".join(output)
            
        except Exception as e:
            return f"Error getting type info for '{type_name}': {str(e)}"
    
    async def list_queries(self) -> str:
        """List all available Query operations."""
        try:
            schema = await self._get_schema()
            query_type_name = schema.get("queryType", {}).get("name")
            if not query_type_name:
                return "No Query type found in schema"
            
            return await self._list_operations(query_type_name, "Query")
            
        except Exception as e:
            return f"Error listing queries: {str(e)}"
    
    async def list_mutations(self) -> str:
        """List all available Mutation operations."""
        try:
            schema = await self._get_schema()
            mutation_type_name = schema.get("mutationType", {}).get("name")
            if not mutation_type_name:
                return "No Mutation type found in schema"
            
            return await self._list_operations(mutation_type_name, "Mutation")
            
        except Exception as e:
            return f"Error listing mutations: {str(e)}"
    
    async def _list_operations(self, type_name: str, operation_type: str) -> str:
        """List operations for a given root type."""
        schema = await self._get_schema()
        types = schema.get("types", [])
        
        type_info = next((t for t in types if t.get("name") == type_name), None)
        if not type_info:
            return f"{operation_type} type '{type_name}' not found"
        
        fields = type_info.get("fields", [])
        if not fields:
            return f"No {operation_type.lower()} operations found"
        
        output = [f"# {operation_type} Operations ({len(fields)} total)\n"]
        
        for field in sorted(fields, key=lambda x: x.get("name", "")):
            field_name = field.get("name", "")
            field_type = self._format_type_ref(field.get("type", {}))
            field_desc = field.get("description", "")
            
            output.append(f"## {field_name}")
            output.append(f"**Returns:** {field_type}")
            if field_desc:
                output.append(f"**Description:** {field_desc}")
            
            # Arguments
            if field.get("args"):
                output.append("**Arguments:**")
                for arg in field["args"]:
                    arg_name = arg.get("name", "")
                    arg_type = self._format_type_ref(arg.get("type", {}))
                    arg_desc = arg.get("description", "")
                    default_value = arg.get("defaultValue")
                    
                    arg_text = f"- {arg_name}: {arg_type}"
                    if default_value:
                        arg_text += f" = {default_value}"
                    if arg_desc:
                        arg_text += f" - {arg_desc}"
                    output.append(arg_text)
            
            if field.get("isDeprecated"):
                reason = field.get("deprecationReason", "No reason provided")
                output.append(f"**⚠️ Deprecated:** {reason}")
            
            output.append("")
        
        return "\n".join(output)
    
    async def analyze_relations(self, type_name: Optional[str] = None) -> str:
        """Analyze relationships between types."""
        try:
            schema = await self._get_schema()
            types = schema.get("types", [])
            user_types = [t for t in types if not t.get("name", "").startswith("__")]
            
            if type_name:
                # Analyze relations for a specific type
                return await self._analyze_type_relations(type_name, user_types)
            else:
                # Analyze all relations
                return await self._analyze_all_relations(user_types)
                
        except Exception as e:
            return f"Error analyzing relations: {str(e)}"
    
    async def _analyze_type_relations(self, type_name: str, types: List[Dict[str, Any]]) -> str:
        """Analyze relations for a specific type."""
        type_info = next((t for t in types if t.get("name") == type_name), None)
        if not type_info:
            return f"Type '{type_name}' not found"
        
        output = [f"# Relations for Type: {type_name}\n"]
        
        # Fields that reference other types
        if type_info.get("fields"):
            output.append("## Fields Referencing Other Types")
            for field in type_info["fields"]:
                field_name = field.get("name", "")
                field_type = field.get("type", {})
                referenced_type = self._extract_base_type_name(field_type)
                
                if referenced_type and referenced_type != type_name and not referenced_type.startswith("__"):
                    output.append(f"- **{field_name}** → {referenced_type}")
        
        # Types that reference this type
        output.append(f"\n## Types Referencing {type_name}")
        referencing_types = []
        
        for other_type in types:
            if other_type.get("name") == type_name:
                continue
            
            if other_type.get("fields"):
                for field in other_type["fields"]:
                    field_type = field.get("type", {})
                    referenced_type = self._extract_base_type_name(field_type)
                    
                    if referenced_type == type_name:
                        referencing_types.append({
                            "type": other_type.get("name"),
                            "field": field.get("name")
                        })
        
        if referencing_types:
            for ref in referencing_types:
                output.append(f"- **{ref['type']}.{ref['field']}** → {type_name}")
        else:
            output.append("No types reference this type")
        
        return "\n".join(output)
    
    async def _analyze_all_relations(self, types: List[Dict[str, Any]]) -> str:
        """Analyze all type relations in the schema."""
        output = ["# Schema Type Relations\n"]
        
        relations = {}
        
        for type_info in types:
            type_name = type_info.get("name", "")
            if not type_info.get("fields"):
                continue
            
            for field in type_info["fields"]:
                field_type = field.get("type", {})
                referenced_type = self._extract_base_type_name(field_type)
                
                if referenced_type and referenced_type != type_name and not referenced_type.startswith("__"):
                    if type_name not in relations:
                        relations[type_name] = set()
                    relations[type_name].add(referenced_type)
        
        # Output relations
        for type_name, referenced_types in sorted(relations.items()):
            output.append(f"## {type_name}")
            for ref_type in sorted(referenced_types):
                output.append(f"- → {ref_type}")
            output.append("")
        
        return "\n".join(output)
    
    def _extract_base_type_name(self, type_ref: Dict[str, Any]) -> Optional[str]:
        """Extract the base type name from a type reference."""
        if not type_ref:
            return None
        
        # Navigate through NON_NULL and LIST wrappers
        current = type_ref
        while current and current.get("kind") in ["NON_NULL", "LIST"]:
            current = current.get("ofType")
        
        return current.get("name") if current else None
    
    async def search_schema(self, query: str) -> str:
        """Search for types and fields matching a query pattern."""
        try:
            schema = await self._get_schema()
            types = schema.get("types", [])
            user_types = [t for t in types if not t.get("name", "").startswith("__")]
            
            query_lower = query.lower()
            results = []
            
            # Search type names
            for type_info in user_types:
                type_name = type_info.get("name", "")
                if query_lower in type_name.lower():
                    results.append({
                        "type": "Type",
                        "name": type_name,
                        "description": type_info.get("description", ""),
                        "kind": type_info.get("kind", "")
                    })
                
                # Search field names
                if type_info.get("fields"):
                    for field in type_info["fields"]:
                        field_name = field.get("name", "")
                        if query_lower in field_name.lower():
                            results.append({
                                "type": "Field",
                                "name": f"{type_name}.{field_name}",
                                "description": field.get("description", ""),
                                "return_type": self._format_type_ref(field.get("type", {}))
                            })
            
            if not results:
                return f"No results found for query: '{query}'"
            
            output = [f"# Search Results for: '{query}' ({len(results)} found)\n"]
            
            # Group by type
            by_type = {}
            for result in results:
                result_type = result["type"]
                if result_type not in by_type:
                    by_type[result_type] = []
                by_type[result_type].append(result)
            
            for result_type, items in by_type.items():
                output.append(f"## {result_type}s ({len(items)})")
                for item in sorted(items, key=lambda x: x["name"]):
                    if result_type == "Type":
                        output.append(f"- **{item['name']}** ({item['kind']})")
                        if item['description']:
                            output.append(f"  {item['description']}")
                    else:  # Field
                        output.append(f"- **{item['name']}**: {item['return_type']}")
                        if item['description']:
                            output.append(f"  {item['description']}")
                output.append("")
            
            return "\n".join(output)
            
        except Exception as e:
            return f"Error searching schema: {str(e)}"
    
    async def execute_query(self, query: str, variables: Optional[Dict[str, Any]] = None, operation_name: Optional[str] = None) -> str:
        """Execute a GraphQL query or mutation and return formatted results."""
        try:
            # Validate query structure
            query = query.strip()
            if not query:
                return "Error: Query cannot be empty"
            
            # Check for potentially dangerous operations (basic safety check)
            dangerous_keywords = ['drop', 'delete', 'truncate', 'alter', 'create']
            query_lower = query.lower()
            for keyword in dangerous_keywords:
                if keyword in query_lower and 'mutation' not in query_lower:
                    return f"Warning: Query contains potentially dangerous keyword '{keyword}'. Please use GraphQL mutations for data modifications."
            
            # Execute the query
            result = await self._execute_query(query, variables, operation_name)
            
            # Format the response
            output = ["# GraphQL Query Results\n"]
            
            # Show the executed query
            output.append("## Query")
            output.append(f"```graphql")
            output.append(query)
            output.append("```")
            
            if variables:
                output.append("\n## Variables")
                output.append(f"```json")
                output.append(json.dumps(variables, indent=2))
                output.append("```")
            
            if operation_name:
                output.append(f"\n**Operation Name:** {operation_name}")
            
            # Show the results
            output.append("\n## Results")
            if result:
                output.append("```json")
                output.append(json.dumps(result, indent=2))
                output.append("```")
                
                # Add summary
                if isinstance(result, dict):
                    keys = list(result.keys())
                    output.append(f"\n**Summary:** Retrieved {len(keys)} root field(s): {', '.join(keys)}")
                elif isinstance(result, list):
                    output.append(f"\n**Summary:** Retrieved {len(result)} items")
            else:
                output.append("No data returned")
            
            return "\n".join(output)
            
        except Exception as e:
            error_output = [
                "# GraphQL Query Error\n",
                f"**Error:** {str(e)}\n",
                "## Query",
                "```graphql",
                query,
                "```"
            ]
            
            if variables:
                error_output.extend([
                    "\n## Variables",
                    "```json",
                    json.dumps(variables, indent=2),
                    "```"
                ])
            
            return "\n".join(error_output)