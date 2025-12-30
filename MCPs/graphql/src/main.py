#!/usr/bin/env python3
"""
GraphQL MCP Server - A Model Context Protocol server for GraphQL schema introspection.
"""

import asyncio
import os
import sys
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    CallToolRequest,
    ListToolsRequest,
    Tool,
    TextContent,
)

from graphql_client import GraphQLClient

# Load environment variables
load_dotenv()

# Initialize GraphQL client
graphql_client = GraphQLClient(
    endpoint=os.getenv("GRAPHQL_ENDPOINT", "https://graphql.testimonial.brownforge.com/v1/graphql"),
    auth_header=os.getenv("GRAPHQL_AUTH_HEADER", "x-hasura-admin-secret"),
    auth_value=os.getenv("GRAPHQL_AUTH_VALUE", ""),
    schema_file=os.getenv("GRAPHQL_SCHEMA_FILE")
)

# Initialize MCP server
app = Server("graphql-introspection")

@app.list_tools()
async def list_tools() -> List[Tool]:
    """List all available GraphQL introspection tools."""
    return [
        Tool(
            name="introspect-schema",
            description="Get GraphQL schema introspection with pagination for large schemas",
            inputSchema={
                "type": "object",
                "properties": {
                    "page": {
                        "type": "integer",
                        "description": "Page number (default: 1)",
                        "minimum": 1
                    },
                    "per_page": {
                        "type": "integer",
                        "description": "Items per page (default: 20, max: 50)",
                        "minimum": 1,
                        "maximum": 50
                    },
                    "filter_kind": {
                        "type": "string",
                        "description": "Filter by type kind (OBJECT, SCALAR, ENUM, INPUT_OBJECT, INTERFACE, UNION)",
                        "enum": ["OBJECT", "SCALAR", "ENUM", "INPUT_OBJECT", "INTERFACE", "UNION"]
                    }
                },
                "additionalProperties": False
            }
        ),
        Tool(
            name="get-type-info",
            description="Get detailed information about a specific GraphQL type",
            inputSchema={
                "type": "object",
                "properties": {
                    "type_name": {
                        "type": "string",
                        "description": "The name of the GraphQL type to inspect"
                    }
                },
                "required": ["type_name"],
                "additionalProperties": False
            }
        ),
        Tool(
            name="list-queries",
            description="List all available Query operations with descriptions and arguments",
            inputSchema={
                "type": "object",
                "properties": {},
                "additionalProperties": False
            }
        ),
        Tool(
            name="list-mutations",
            description="List all available Mutation operations with descriptions and arguments",
            inputSchema={
                "type": "object",
                "properties": {},
                "additionalProperties": False
            }
        ),
        Tool(
            name="analyze-relations",
            description="Analyze relationships between GraphQL types",
            inputSchema={
                "type": "object",
                "properties": {
                    "type_name": {
                        "type": "string",
                        "description": "The name of the type to analyze relations for (optional)"
                    }
                },
                "additionalProperties": False
            }
        ),
        Tool(
            name="search-schema",
            description="Search for types and fields by name pattern",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to match against type and field names"
                    }
                },
                "required": ["query"],
                "additionalProperties": False
            }
        ),
        Tool(
            name="execute-query",
            description="Execute a GraphQL query or mutation against the endpoint",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The GraphQL query or mutation to execute"
                    },
                    "variables": {
                        "type": "object",
                        "description": "Variables for the GraphQL query (optional)",
                        "additionalProperties": True
                    },
                    "operation_name": {
                        "type": "string",
                        "description": "Operation name if the query contains multiple operations (optional)"
                    }
                },
                "required": ["query"],
                "additionalProperties": False
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle tool calls for GraphQL introspection."""

    if name == "introspect-schema":
        page = arguments.get("page", 1)
        per_page = min(arguments.get("per_page", 20), 50)  # Cap at 50
        filter_kind = arguments.get("filter_kind")
        result = await graphql_client.introspect_schema(page, per_page, filter_kind)
        return [TextContent(type="text", text=result)]

    elif name == "get-type-info":
        type_name = arguments.get("type_name")
        if not type_name:
            return [TextContent(type="text", text="Error: type_name is required")]
        result = await graphql_client.get_type_info(type_name)
        return [TextContent(type="text", text=result)]

    elif name == "list-queries":
        result = await graphql_client.list_queries()
        return [TextContent(type="text", text=result)]

    elif name == "list-mutations":
        result = await graphql_client.list_mutations()
        return [TextContent(type="text", text=result)]

    elif name == "analyze-relations":
        type_name = arguments.get("type_name")
        result = await graphql_client.analyze_relations(type_name)
        return [TextContent(type="text", text=result)]

    elif name == "search-schema":
        query = arguments.get("query")
        if not query:
            return [TextContent(type="text", text="Error: query is required")]
        result = await graphql_client.search_schema(query)
        return [TextContent(type="text", text=result)]

    elif name == "execute-query":
        query = arguments.get("query")
        if not query:
            return [TextContent(type="text", text="Error: query is required")]

        variables = arguments.get("variables")
        operation_name = arguments.get("operation_name")

        result = await graphql_client.execute_query(query, variables, operation_name)
        return [TextContent(type="text", text=result)]

    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

async def main():
    """Main entry point for the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
