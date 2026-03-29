"""Machine learning endpoints for anomaly detection, forecasting, and predictions."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/ml", tags=["ml"])


class MetricDataPoint(BaseModel):
    """A single metric data point with timestamp and value."""

    timestamp: str  # ISO 8601 format
    value: float


class AnomalyDetectionRequest(BaseModel):
    """Request model for anomaly detection."""

    metric_name: str
    data_points: List[MetricDataPoint]
    sensitivity: float = 0.8  # 0.0 to 1.0
    window_size: int = 20


class AnomalyDataPoint(BaseModel):
    """Anomaly detection result for a single point."""

    timestamp: str
    value: float
    is_anomaly: bool
    anomaly_score: float
    expected_range: tuple[float, float]


class AnomalyDetectionResponse(BaseModel):
    """Response model for anomaly detection."""

    metric_name: str
    anomalies_detected: int
    results: List[AnomalyDataPoint]
    baseline_mean: float
    baseline_std: float


class ForecastRequest(BaseModel):
    """Request model for forecasting."""

    metric_name: str
    data_points: List[MetricDataPoint]
    forecast_hours: int = 24
    confidence_level: float = 0.95  # 0.8 to 0.99


class ForecastPoint(BaseModel):
    """A forecasted metric value."""

    timestamp: str
    predicted_value: float
    lower_bound: float
    upper_bound: float
    confidence: float


class ForecastResponse(BaseModel):
    """Response model for forecast."""

    metric_name: str
    forecast_hours: int
    historical_mean: float
    trend: str  # "increasing", "decreasing", "stable"
    predictions: List[ForecastPoint]


class QueryClassificationRequest(BaseModel):
    """Request model for query classification."""

    query: str
    execution_time_ms: float
    rows_examined: int
    rows_returned: int


class QueryClassificationResponse(BaseModel):
    """Response model for query classification."""

    query: str
    query_type: str  # SELECT, INSERT, UPDATE, DELETE, JOIN, AGGREGATE
    complexity_level: str  # simple, moderate, complex
    complexity_score: float
    estimated_cost: float
    classification_confidence: float


class CapacityPredictionRequest(BaseModel):
    """Request model for capacity prediction."""

    metric_type: str  # cpu, memory, disk, connections
    current_usage: float
    historical_data_points: List[MetricDataPoint]
    growth_rate_percent_per_day: Optional[float] = None


class CapacityPredictionResponse(BaseModel):
    """Response model for capacity prediction."""

    metric_type: str
    current_usage: float
    capacity_limit: float
    days_until_exhaustion: float
    threshold_warning_percent: float
    recommended_action: str


@router.post("/anomaly-detect", response_model=AnomalyDetectionResponse)
async def detect_anomalies(request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
    """
    Detect anomalies in metric time series data using statistical analysis.

    Args:
        request: Anomaly detection request with metric data points

    Returns:
        Anomaly detection results with scores and flagged anomalies
    """
    if not request.data_points:
        raise HTTPException(status_code=400, detail="No data points provided")

    # Placeholder implementation
    values = [dp.value for dp in request.data_points]
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    std = variance ** 0.5

    results = []
    anomaly_count = 0

    for dp in request.data_points:
        z_score = abs((dp.value - mean) / (std + 1e-6))
        is_anomaly = z_score > (3 - request.sensitivity * 2)
        if is_anomaly:
            anomaly_count += 1

        results.append(
            AnomalyDataPoint(
                timestamp=dp.timestamp,
                value=dp.value,
                is_anomaly=is_anomaly,
                anomaly_score=min(z_score, 10.0),
                expected_range=(mean - 2 * std, mean + 2 * std),
            )
        )

    return AnomalyDetectionResponse(
        metric_name=request.metric_name,
        anomalies_detected=anomaly_count,
        results=results,
        baseline_mean=mean,
        baseline_std=std,
    )


@router.post("/forecast", response_model=ForecastResponse)
async def forecast_metrics(request: ForecastRequest) -> ForecastResponse:
    """
    Forecast metric values for the next N hours using time series prediction.

    Args:
        request: Forecast request with historical data and forecast period

    Returns:
        Predicted values with confidence intervals for forecast period
    """
    if not request.data_points:
        raise HTTPException(status_code=400, detail="No historical data provided")

    # Placeholder implementation
    values = [dp.value for dp in request.data_points]
    mean = sum(values) / len(values)
    trend = "stable"
    if len(values) > 1:
        recent_trend = (values[-1] - values[0]) / len(values)
        if recent_trend > mean * 0.05:
            trend = "increasing"
        elif recent_trend < -mean * 0.05:
            trend = "decreasing"

    predictions = []
    for i in range(request.forecast_hours):
        predicted = mean + (i * 0.5) if trend == "increasing" else mean
        margin = mean * (1 - request.confidence_level) * 0.5

        predictions.append(
            ForecastPoint(
                timestamp=f"2026-03-{29 + i // 24}T{(i % 24):02d}:00:00Z",
                predicted_value=predicted,
                lower_bound=predicted - margin,
                upper_bound=predicted + margin,
                confidence=request.confidence_level,
            )
        )

    return ForecastResponse(
        metric_name=request.metric_name,
        forecast_hours=request.forecast_hours,
        historical_mean=mean,
        trend=trend,
        predictions=predictions,
    )


@router.post("/query-classify", response_model=QueryClassificationResponse)
async def classify_query(request: QueryClassificationRequest) -> QueryClassificationResponse:
    """
    Classify a query by type and estimate its complexity level.

    Args:
        request: Query classification request with query and metrics

    Returns:
        Query classification with complexity level and cost estimation
    """
    query_upper = request.query.upper()

    if "SELECT" in query_upper:
        query_type = "SELECT"
    elif "INSERT" in query_upper:
        query_type = "INSERT"
    elif "UPDATE" in query_upper:
        query_type = "UPDATE"
    elif "DELETE" in query_upper:
        query_type = "DELETE"
    else:
        query_type = "OTHER"

    if "JOIN" in query_upper:
        query_type = "JOIN"
    elif "GROUP BY" in query_upper or "HAVING" in query_upper:
        query_type = "AGGREGATE"

    complexity_score = min(
        len(request.query) / 100 * (1 + request.execution_time_ms / 1000),
        10.0,
    )

    if complexity_score < 2:
        complexity_level = "simple"
    elif complexity_score < 6:
        complexity_level = "moderate"
    else:
        complexity_level = "complex"

    estimated_cost = request.execution_time_ms * request.rows_examined / 1000

    return QueryClassificationResponse(
        query=request.query,
        query_type=query_type,
        complexity_level=complexity_level,
        complexity_score=complexity_score,
        estimated_cost=estimated_cost,
        classification_confidence=0.92,
    )


@router.post("/capacity-predict", response_model=CapacityPredictionResponse)
async def predict_capacity(request: CapacityPredictionRequest) -> CapacityPredictionResponse:
    """
    Predict when system resources will be exhausted based on current trends.

    Args:
        request: Capacity prediction request with historical usage data

    Returns:
        Predicted days until resource exhaustion and recommendations
    """
    capacity_limits = {
        "cpu": 100.0,
        "memory": 100.0,
        "disk": 100.0,
        "connections": 500.0,
    }

    capacity_limit = capacity_limits.get(request.metric_type, 100.0)

    if request.growth_rate_percent_per_day:
        growth_rate = request.growth_rate_percent_per_day
    else:
        if len(request.historical_data_points) > 1:
            values = [dp.value for dp in request.historical_data_points]
            growth_rate = ((values[-1] - values[0]) / values[0] * 100) if values[0] > 0 else 0
        else:
            growth_rate = 2.0

    remaining_capacity = capacity_limit - request.current_usage
    if growth_rate > 0:
        days_until_exhaustion = (remaining_capacity / (request.current_usage * growth_rate / 100)) if request.current_usage > 0 else float('inf')
    else:
        days_until_exhaustion = float('inf')

    if days_until_exhaustion < 30:
        recommended_action = f"Urgent: Scale up {request.metric_type} capacity immediately"
    elif days_until_exhaustion < 90:
        recommended_action = f"Plan capacity upgrade for {request.metric_type} within 60 days"
    else:
        recommended_action = f"Monitor {request.metric_type} growth - no immediate action needed"

    return CapacityPredictionResponse(
        metric_type=request.metric_type,
        current_usage=request.current_usage,
        capacity_limit=capacity_limit,
        days_until_exhaustion=min(days_until_exhaustion, 999),
        threshold_warning_percent=80.0,
        recommended_action=recommended_action,
    )
