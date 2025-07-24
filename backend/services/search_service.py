import os
import httpx
from typing import List, Dict, Any
from datetime import datetime

class SearchService:
    def __init__(self):
        self.serpapi_key = os.getenv("SERPAPI_KEY")
        self.backup_search_url = "https://api.duckduckgo.com"
        
    async def search_web(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search the web using SerpAPI or fallback to demo results."""
        
        if self.serpapi_key:
            return await self._search_with_serpapi(query, limit)
        else:
            return await self._demo_search_results(query, limit)
    
    async def _search_with_serpapi(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Search using SerpAPI (Google Search API)."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://serpapi.com/search",
                    params={
                        "engine": "google",
                        "q": query,
                        "api_key": self.serpapi_key,
                        "num": limit,
                        "format": "json"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    
                    for result in data.get("organic_results", [])[:limit]:
                        results.append({
                            "title": result.get("title", ""),
                            "url": result.get("link", ""),
                            "snippet": result.get("snippet", ""),
                            "source": result.get("displayed_link", ""),
                            "date": None  # SerpAPI doesn't always provide dates
                        })
                    
                    return results
                else:
                    return await self._demo_search_results(query, limit)
                    
        except Exception as e:
            print(f"SerpAPI search failed: {e}")
            return await self._demo_search_results(query, limit)
    
    async def _demo_search_results(self, query: str, limit: int) -> List[Dict[str, Any]]:
        """Return demo search results when real search is not available."""
        return [
            {
                "title": f"Demo Result 1: {query}",
                "url": "https://example.com/result1",
                "snippet": f"This is a demo search result for '{query}'. In production, this would use real search APIs like SerpAPI to provide current information from the web.",
                "source": "example.com",
                "date": datetime.now()
            },
            {
                "title": f"Learn more about {query}",
                "url": "https://demo.com/learn",
                "snippet": f"Comprehensive information about {query} including definitions, examples, and related topics. This demo result shows what real search results would look like.",
                "source": "demo.com", 
                "date": datetime.now()
            },
            {
                "title": f"{query} - Wikipedia",
                "url": "https://en.wikipedia.org/wiki/Demo",
                "snippet": f"Wikipedia article about {query} with detailed information, history, and references. This would be a real Wikipedia result in production.",
                "source": "wikipedia.org",
                "date": datetime.now()
            }
        ][:limit]
    
    async def get_search_suggestions(self, partial_query: str) -> List[str]:
        """Get search suggestions for autocomplete."""
        # In production, this could use Google Suggest API or similar
        return [
            f"{partial_query} definition",
            f"{partial_query} examples", 
            f"{partial_query} tutorial",
            f"how to {partial_query}",
            f"what is {partial_query}",
            f"{partial_query} benefits",
            f"{partial_query} vs alternatives",
            f"best {partial_query}",
            f"{partial_query} guide",
            f"{partial_query} tips"
        ]