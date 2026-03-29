import pytest
import numpy as np
import pandas as pd
from unittest.mock import Mock, patch


class MockQueryAnalyzer:
    """Mock QueryAnalyzer for testing"""

    def analyze(self, query: str) -> dict:
        """Analyze SQL query and return metrics"""
        if "SELECT" in query.upper():
            return {
                "type": "SELECT",
                "complexity": "simple" if query.count("JOIN") == 0 else "complex",
                "joins": query.count("JOIN"),
                "subqueries": query.count("(SELECT"),
            }
        elif "INSERT" in query.upper():
            return {
                "type": "INSERT",
                "complexity": "simple",
                "rows_affected": 1,
            }
        return {"type": "UNKNOWN", "complexity": "unknown"}

    def find_slow_patterns(self, queries: list) -> list:
        """Find slow query patterns"""
        slow_patterns = []
        for query in queries:
            if "LIKE '%" in query or "LIKE %'" in query:
                slow_patterns.append({"pattern": "leading_wildcard", "query": query})
            if query.count("JOIN") > 3:
                slow_patterns.append({"pattern": "excessive_joins", "query": query})
            if "SELECT *" in query.upper() and "JOIN" in query.upper():
                slow_patterns.append({"pattern": "select_star_with_join", "query": query})
        return slow_patterns


class MockTableStatsAnalyzer:
    """Mock TableStatsAnalyzer for testing"""

    def __init__(self):
        self.stats = None

    def analyze(self, data: dict) -> dict:
        """Analyze table statistics"""
        df = pd.DataFrame(data)
        return {
            "row_count": len(df),
            "columns": list(df.columns),
            "memory_usage_mb": df.memory_usage(deep=True).sum() / (1024**2),
            "null_counts": df.isnull().sum().to_dict(),
        }


class TestQueryAnalyzer:
    """Test suite for QueryAnalyzer"""

    def setup_method(self):
        """Setup test fixtures"""
        self.analyzer = MockQueryAnalyzer()

    def test_analyze_select_query(self):
        """Test analyzing a simple SELECT query"""
        query = "SELECT id, name, email FROM users"
        result = self.analyzer.analyze(query)

        assert result["type"] == "SELECT"
        assert result["complexity"] == "simple"
        assert result["joins"] == 0

    def test_analyze_select_with_join(self):
        """Test analyzing SELECT query with JOIN"""
        query = """
            SELECT u.id, u.name, o.order_id
            FROM users u
            JOIN orders o ON u.id = o.user_id
        """
        result = self.analyzer.analyze(query)

        assert result["type"] == "SELECT"
        assert result["complexity"] == "complex"
        assert result["joins"] == 1

    def test_analyze_insert_query(self):
        """Test analyzing an INSERT query"""
        query = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')"
        result = self.analyzer.analyze(query)

        assert result["type"] == "INSERT"
        assert result["complexity"] == "simple"
        assert result["rows_affected"] == 1

    def test_analyze_unknown_query(self):
        """Test analyzing an unknown query type"""
        query = "TRUNCATE TABLE users"
        result = self.analyzer.analyze(query)

        assert result["type"] == "UNKNOWN"
        assert result["complexity"] == "unknown"


class TestSlowPatterns:
    """Test suite for slow query pattern detection"""

    def setup_method(self):
        """Setup test fixtures"""
        self.analyzer = MockQueryAnalyzer()

    def test_find_leading_wildcard(self):
        """Test detecting leading wildcard patterns"""
        queries = [
            "SELECT * FROM users WHERE name LIKE '%john%'",
            "SELECT * FROM products WHERE sku LIKE '%ABC'",
        ]
        patterns = self.analyzer.find_slow_patterns(queries)

        assert len(patterns) >= 1
        assert any(p["pattern"] == "leading_wildcard" for p in patterns)

    def test_find_excessive_joins(self):
        """Test detecting excessive JOINs"""
        query = """
            SELECT * FROM a
            JOIN b ON a.id = b.a_id
            JOIN c ON b.id = c.b_id
            JOIN d ON c.id = d.c_id
            JOIN e ON d.id = e.d_id
        """
        patterns = self.analyzer.find_slow_patterns([query])

        assert len(patterns) >= 1
        assert any(p["pattern"] == "excessive_joins" for p in patterns)

    def test_find_select_star_with_join(self):
        """Test detecting SELECT * with JOINs"""
        query = """
            SELECT * FROM users
            JOIN orders ON users.id = orders.user_id
        """
        patterns = self.analyzer.find_slow_patterns([query])

        assert len(patterns) >= 1
        assert any(p["pattern"] == "select_star_with_join" for p in patterns)

    def test_no_slow_patterns(self):
        """Test query with no slow patterns"""
        query = "SELECT id, name FROM users WHERE id = 1"
        patterns = self.analyzer.find_slow_patterns([query])

        assert len(patterns) == 0


class TestTableStatsAnalyzer:
    """Test suite for TableStatsAnalyzer"""

    def setup_method(self):
        """Setup test fixtures"""
        self.analyzer = MockTableStatsAnalyzer()

    def test_analyze_empty_table(self):
        """Test analyzing an empty table"""
        data = {
            "id": [],
            "name": [],
            "email": [],
        }
        stats = self.analyzer.analyze(data)

        assert stats["row_count"] == 0
        assert stats["columns"] == ["id", "name", "email"]

    def test_analyze_sample_table(self):
        """Test analyzing a table with sample data"""
        data = {
            "id": [1, 2, 3, 4, 5],
            "name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
            "email": ["alice@ex.com", "bob@ex.com", None, "diana@ex.com", "eve@ex.com"],
        }
        stats = self.analyzer.analyze(data)

        assert stats["row_count"] == 5
        assert len(stats["columns"]) == 3
        assert "email" in stats["null_counts"]
        assert stats["null_counts"]["email"] == 1

    def test_analyze_numeric_table(self):
        """Test analyzing a table with numeric data"""
        data = {
            "id": range(100),
            "value": np.random.rand(100),
            "count": np.random.randint(0, 1000, 100),
        }
        stats = self.analyzer.analyze(data)

        assert stats["row_count"] == 100
        assert stats["memory_usage_mb"] > 0
        assert all(count == 0 for count in stats["null_counts"].values())
