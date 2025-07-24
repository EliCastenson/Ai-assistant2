from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    date: Optional[datetime] = None

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total_results: int
    search_time: float

@router.get("/web", response_model=SearchResponse)
async def search_web(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=20, description="Number of results")
):
    """Search the web for information."""
    try:
        # Demo implementation - in production, use SerpAPI or similar
        demo_results = [
            SearchResult(
                title=f"Demo result for: {q}",
                url="https://example.com/result1",
                snippet=f"This is a demo search result for the query '{q}'. In production, this would use a real search API like SerpAPI.",
                source="example.com",
                date=datetime.now()
            ),
            SearchResult(
                title=f"Another result about {q}",
                url="https://demo.com/result2",
                snippet=f"More information about {q} can be found here. This is demonstration content.",
                source="demo.com",
                date=datetime.now()
            )
        ]
        
        return SearchResponse(
            query=q,
            results=demo_results[:limit],
            total_results=len(demo_results),
            search_time=0.25
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing search: {str(e)}")

@router.get("/suggestions")
async def get_search_suggestions(q: str = Query(..., description="Partial query")):
    """Get search suggestions for autocomplete."""
    return {
        "query": q,
        "suggestions": [
            f"{q} definition",
            f"{q} examples",
            f"{q} tutorial",
            f"how to {q}",
            f"what is {q}"
        ]
    }