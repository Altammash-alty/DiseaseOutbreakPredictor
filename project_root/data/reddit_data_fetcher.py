"""
Fabricated Reddit/Mastodon/Bluesky fetcher — returns instant mock mention counts.
Keeps the original predict.py import intact.
"""

MOCK_SOCIAL = {
    "fever Mumbai":    {"reddit": 142, "mastodon": 87,  "bluesky": 63},
    "fever Delhi":     {"reddit": 198, "mastodon": 112, "bluesky": 79},
    "fever Kolkata":   {"reddit": 95,  "mastodon": 58,  "bluesky": 41},
    "fever Chennai":   {"reddit": 67,  "mastodon": 34,  "bluesky": 28},
    "fever Bangalore": {"reddit": 22,  "mastodon": 15,  "bluesky": 9},
}

def reddit_mentions(query: str) -> int:
    """Returns fabricated Reddit mention count instantly."""
    return MOCK_SOCIAL.get(query, {}).get("reddit", 15)

def mastodon_mentions(query: str) -> int:
    """Returns fabricated Mastodon mention count instantly."""
    return MOCK_SOCIAL.get(query, {}).get("mastodon", 8)

def bluesky_mentions(query: str) -> int:
    """Returns fabricated Bluesky mention count instantly."""
    return MOCK_SOCIAL.get(query, {}).get("bluesky", 5)