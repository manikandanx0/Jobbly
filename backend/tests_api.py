"""
Simple integration smoke tests for the Flask API.

Usage:
  backend\venv\Scripts\python.exe backend\tests_api.py

Assumes the API server is already running locally at http://localhost:5000
and environment variables are configured.
"""

import json
import os
import sys
import time
from typing import Any, Dict

import httpx

BASE = os.environ.get("API_BASE", "http://localhost:5000")


def p(title: str, resp: httpx.Response):
    try:
        data = resp.json()
    except Exception:
        data = resp.text
    print(f"\n=== {title} ===")
    print(f"{resp.request.method} {resp.request.url}")
    print(f"Status: {resp.status_code}")
    print("Body:")
    print(json.dumps(data, indent=2) if isinstance(data, (dict, list)) else data)


def test_health(client: httpx.Client):
    r = client.get(f"{BASE}/health", timeout=10)
    p("Health", r)


def test_root(client: httpx.Client):
    r = client.get(f"{BASE}/", timeout=10)
    p("Root", r)


def test_languages(client: httpx.Client):
    r = client.get(f"{BASE}/api/multilingual/languages", timeout=15)
    p("Multilingual Languages", r)


def test_detect(client: httpx.Client):
    r = client.post(
        f"{BASE}/api/multilingual/detect",
        json={"text": "Hello from Jobbly"},
        timeout=15,
    )
    p("Language Detect", r)


def test_signup_and_login(client: httpx.Client) -> Dict[str, Any]:
    email = f"test_{int(time.time())}@example.com"
    password = "P@ssw0rd!"
    name = "Test User"

    # Signup
    rs = client.post(
        f"{BASE}/api/users/signup",
        json={"email": email, "password": password, "name": name},
        timeout=20,
    )
    p("Users Signup", rs)

    # Login (expected to succeed via Supabase or fallback table)
    rl = client.post(
        f"{BASE}/api/users/login",
        json={"email": email, "password": password},
        timeout=20,
    )
    p("Users Login", rl)

    token = None
    try:
        token = rl.json().get("access_token") if rl.status_code == 200 else None
    except Exception:
        pass
    return {"email": email, "password": password, "token": token}


def test_applications_flow(client: httpx.Client, token: str | None):
    # This uses minimal flow with fake IDs to validate validation paths
    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # POST without required fields -> expect 400
    r_bad = client.post(
        f"{BASE}/api/multilingual/applications",
        json={"job_type": "internship"},
        headers=headers,
        timeout=20,
    )
    p("Applications POST (missing fields)", r_bad)

    # GET current user's applications (may be empty)
    r_get = client.get(
        f"{BASE}/api/multilingual/applications",
        headers=headers,
        timeout=20,
    )
    p("Applications GET", r_get)


def main():
    with httpx.Client() as client:
        test_health(client)
        test_root(client)
        test_languages(client)
        test_detect(client)
        auth = test_signup_and_login(client)
        test_applications_flow(client, auth.get("token"))


if __name__ == "__main__":
    main()


