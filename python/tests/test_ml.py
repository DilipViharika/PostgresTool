import pytest
import numpy as np
from unittest.mock import Mock, patch


class MockAnomalyDetector:
    """Mock AnomalyDetector for testing"""

    def __init__(self, threshold: float = 2.0):
        self.threshold = threshold
        self.mean = None
        self.std = None

    def fit(self, data: list):
        """Fit detector on normal data"""
        self.mean = np.mean(data)
        self.std = np.std(data)

    def detect(self, values: list) -> list:
        """Detect anomalies in values"""
        if self.mean is None:
            self.fit(values)

        anomalies = []
        for idx, val in enumerate(values):
            z_score = abs((val - self.mean) / (self.std + 1e-8))
            if z_score > self.threshold:
                anomalies.append({"index": idx, "value": val, "z_score": z_score})
        return anomalies


class MockMetricForecaster:
    """Mock MetricForecaster for testing"""

    def __init__(self, horizon: int = 24):
        self.horizon = horizon
        self.data = None

    def forecast(self, historical_data: list) -> dict:
        """Forecast metrics for given horizon"""
        if len(historical_data) < 2:
            raise ValueError("Need at least 2 data points")

        trend = (historical_data[-1] - historical_data[-2]) / (historical_data[-2] + 1e-8)
        forecast = []

        for i in range(self.horizon):
            next_val = historical_data[-1] * (1 + trend)
            forecast.append(next_val)
            historical_data = historical_data[1:] + [next_val]

        return {
            "horizon": self.horizon,
            "forecast": forecast,
            "trend": trend,
        }


class MockQueryClassifier:
    """Mock QueryClassifier for testing"""

    def classify(self, query: str) -> dict:
        """Classify query by type"""
        query_upper = query.upper()

        if "SELECT" in query_upper and "COUNT" in query_upper:
            return {"type": "aggregation", "confidence": 0.95}
        elif "SELECT" in query_upper and "GROUP BY" in query_upper:
            return {"type": "grouping", "confidence": 0.92}
        elif "INSERT" in query_upper or "UPDATE" in query_upper or "DELETE" in query_upper:
            return {"type": "write", "confidence": 0.98}
        elif "SELECT" in query_upper:
            return {"type": "read", "confidence": 0.99}
        else:
            return {"type": "other", "confidence": 0.5}


class MockCapacityPredictor:
    """Mock CapacityPredictor for testing"""

    def __init__(self):
        self.capacity_threshold = 0.8

    def predict(self, current_usage: float, growth_rate: float, days_ahead: int = 30) -> dict:
        """Predict when capacity will be exceeded"""
        future_usage = current_usage * ((1 + growth_rate) ** days_ahead)

        return {
            "days_ahead": days_ahead,
            "current_usage": current_usage,
            "future_usage": future_usage,
            "growth_rate": growth_rate,
            "threshold_exceeded": future_usage > self.capacity_threshold,
            "days_until_threshold": None
            if future_usage <= self.capacity_threshold
            else max(1, int(days_ahead / 2)),
        }


class TestAnomalyDetector:
    """Test suite for AnomalyDetector"""

    def setup_method(self):
        """Setup test fixtures"""
        self.detector = MockAnomalyDetector(threshold=2.0)

    def test_detect_normal_data(self):
        """Test detector with normal data"""
        normal_data = [10, 11, 12, 11, 10, 12, 11, 10, 11, 12]
        anomalies = self.detector.detect(normal_data)

        assert len(anomalies) == 0

    def test_detect_with_spike(self):
        """Test detector with anomalous spike"""
        data = [10, 11, 12, 11, 10, 100, 11, 10, 11, 12]
        anomalies = self.detector.detect(data)

        assert len(anomalies) > 0
        assert any(a["index"] == 5 for a in anomalies)

    def test_detect_with_multiple_anomalies(self):
        """Test detector with multiple anomalies"""
        data = [10, 11, 12, 100, 11, 10, -50, 11, 10, 12]
        anomalies = self.detector.detect(data)

        assert len(anomalies) >= 2

    def test_detector_threshold(self):
        """Test detector with custom threshold"""
        detector = MockAnomalyDetector(threshold=1.5)
        data = [10, 11, 12, 11, 10, 50, 11, 10, 11, 12]
        anomalies = detector.detect(data)

        assert len(anomalies) > 0


class TestMetricForecaster:
    """Test suite for MetricForecaster"""

    def setup_method(self):
        """Setup test fixtures"""
        self.forecaster = MockMetricForecaster(horizon=24)

    def test_forecast_returns_correct_horizon(self):
        """Test forecaster returns correct number of predictions"""
        historical = [100, 105, 110, 108, 112]
        result = self.forecaster.forecast(historical)

        assert result["horizon"] == 24
        assert len(result["forecast"]) == 24

    def test_forecast_upward_trend(self):
        """Test forecaster with upward trend"""
        historical = [100, 110, 120, 130]
        result = self.forecaster.forecast(historical)

        assert result["trend"] > 0
        assert result["forecast"][0] > historical[-1]

    def test_forecast_downward_trend(self):
        """Test forecaster with downward trend"""
        historical = [130, 120, 110, 100]
        result = self.forecaster.forecast(historical)

        assert result["trend"] < 0

    def test_forecast_insufficient_data(self):
        """Test forecaster with insufficient data"""
        with pytest.raises(ValueError):
            self.forecaster.forecast([100])


class TestQueryClassifier:
    """Test suite for QueryClassifier"""

    def setup_method(self):
        """Setup test fixtures"""
        self.classifier = MockQueryClassifier()

    def test_classify_read_query(self):
        """Test classifying a read query"""
        query = "SELECT id, name FROM users WHERE active = true"
        result = self.classifier.classify(query)

        assert result["type"] == "read"
        assert result["confidence"] > 0.9

    def test_classify_aggregation_query(self):
        """Test classifying an aggregation query"""
        query = "SELECT COUNT(*) as total FROM orders"
        result = self.classifier.classify(query)

        assert result["type"] == "aggregation"
        assert result["confidence"] > 0.9

    def test_classify_grouping_query(self):
        """Test classifying a grouping query"""
        query = "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id"
        result = self.classifier.classify(query)

        assert result["type"] == "grouping"
        assert result["confidence"] > 0.9

    def test_classify_write_query_insert(self):
        """Test classifying an INSERT query"""
        query = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')"
        result = self.classifier.classify(query)

        assert result["type"] == "write"
        assert result["confidence"] > 0.9

    def test_classify_write_query_update(self):
        """Test classifying an UPDATE query"""
        query = "UPDATE users SET active = false WHERE last_login < NOW() - INTERVAL '30 days'"
        result = self.classifier.classify(query)

        assert result["type"] == "write"
        assert result["confidence"] > 0.9

    def test_classify_write_query_delete(self):
        """Test classifying a DELETE query"""
        query = "DELETE FROM logs WHERE created_at < NOW() - INTERVAL '1 year'"
        result = self.classifier.classify(query)

        assert result["type"] == "write"
        assert result["confidence"] > 0.9


class TestCapacityPredictor:
    """Test suite for CapacityPredictor"""

    def setup_method(self):
        """Setup test fixtures"""
        self.predictor = MockCapacityPredictor()

    def test_predict_no_threshold_exceeded(self):
        """Test prediction when threshold not exceeded"""
        result = self.predictor.predict(current_usage=0.5, growth_rate=0.01, days_ahead=30)

        assert result["current_usage"] == 0.5
        assert result["days_ahead"] == 30
        assert result["threshold_exceeded"] is False

    def test_predict_threshold_exceeded(self):
        """Test prediction when threshold is exceeded"""
        result = self.predictor.predict(current_usage=0.7, growth_rate=0.1, days_ahead=30)

        assert result["threshold_exceeded"] is True
        assert result["days_until_threshold"] is not None

    def test_predict_high_growth_rate(self):
        """Test prediction with high growth rate"""
        result = self.predictor.predict(current_usage=0.5, growth_rate=0.5, days_ahead=30)

        assert result["future_usage"] > result["current_usage"]

    def test_predict_negative_growth_rate(self):
        """Test prediction with negative growth rate"""
        result = self.predictor.predict(current_usage=0.6, growth_rate=-0.05, days_ahead=30)

        assert result["future_usage"] < result["current_usage"]
