"""
Pagination utilities for large schema responses.
"""

from typing import Any, Dict, List, Optional, Tuple


def paginate_schema_types(types: List[Dict[str, Any]], page: int = 1, per_page: int = 20, filter_kind: Optional[str] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Paginate schema types with optional filtering.
    
    Args:
        types: List of GraphQL types
        page: Page number (1-indexed)
        per_page: Items per page
        filter_kind: Optional type kind filter (OBJECT, SCALAR, ENUM, etc.)
    
    Returns:
        Tuple of (paginated_types, pagination_info)
    """
    # Filter by kind if specified
    if filter_kind:
        filtered_types = [t for t in types if t.get("kind") == filter_kind.upper()]
    else:
        # Filter out introspection types
        filtered_types = [t for t in types if not t.get("name", "").startswith("__")]
    
    total = len(filtered_types)
    total_pages = (total + per_page - 1) // per_page  # Ceiling division
    
    # Calculate start and end indices
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    # Get paginated results
    paginated_types = filtered_types[start_idx:end_idx]
    
    pagination_info = {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "prev_page": page - 1 if page > 1 else None
    }
    
    return paginated_types, pagination_info


def paginate_fields(fields: List[Dict[str, Any]], page: int = 1, per_page: int = 15, search_query: Optional[str] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Paginate type fields with optional search.
    
    Args:
        fields: List of GraphQL fields
        page: Page number (1-indexed)
        per_page: Items per page
        search_query: Optional search query for field names
    
    Returns:
        Tuple of (paginated_fields, pagination_info)
    """
    # Filter by search query if specified
    if search_query:
        query_lower = search_query.lower()
        filtered_fields = [
            f for f in fields 
            if query_lower in f.get("name", "").lower() or 
               query_lower in f.get("description", "").lower()
        ]
    else:
        filtered_fields = fields
    
    total = len(filtered_fields)
    total_pages = (total + per_page - 1) // per_page
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    
    paginated_fields = filtered_fields[start_idx:end_idx]
    
    pagination_info = {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "next_page": page + 1 if page < total_pages else None,
        "prev_page": page - 1 if page > 1 else None,
        "search_query": search_query
    }
    
    return paginated_fields, pagination_info


def format_pagination_info(pagination: Dict[str, Any]) -> str:
    """Format pagination info for display."""
    info_parts = [
        f"Page {pagination['page']} of {pagination['total_pages']}",
        f"({pagination['total']} total items)"
    ]
    
    if pagination.get("search_query"):
        info_parts.insert(0, f"Search: '{pagination['search_query']}'")
    
    navigation = []
    if pagination["has_prev"]:
        navigation.append(f"← Previous (page {pagination['prev_page']})")
    if pagination["has_next"]:
        navigation.append(f"Next (page {pagination['next_page']}) →")
    
    result = " | ".join(info_parts)
    if navigation:
        result += "\n**Navigation:** " + " • ".join(navigation)
    
    return result