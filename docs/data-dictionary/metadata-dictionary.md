# Core Metadata & Indicators Dictionary

## Core Result Indicators
1. **Tracer Medicine Availability (%)**:
   - `UID`: `indTracerAvail`
   - `Formula`: `(#{TRACER_AVAIL_COUNT} / #{TRACER_TOTAL_COUNT}) * 100`
   - `Baseline`: 65.0% | `Target`: 85.0%
   - `Aggregation`: AVERAGE_SUM_ORG_UNIT

2. **Stock-out Rate (%)**:
   - `UID`: `indStockoutRate`
   - `Formula`: `(#{STOCKOUT_DAYS_COUNT} / #{FACILITY_DAYS_OBSERVED}) * 100`
   - `Baseline`: 28.0% | `Target`: < 5.0%
   - `Aggregation`: SUM

3. **Facilities with Functional DTC (%)**:
   - `UID`: `indDtcFunctionality`
   - `Formula`: `(#{DTC_FUNCTIONAL_FLAG} / 1) * 100`
   - `Baseline`: 42.0% | `Target`: 80.0%
   - `Aggregation`: LAST

4. **Training Female Reach (%)**:
   - `UID`: `indTrainingGender`
   - `Formula`: `(#{HCW_TRAINED_FEMALE} / #{HCW_TRAINED_TOTAL}) * 100`
   - `Baseline`: 38.0% | `Target`: 50.0%
   - `Aggregation`: SUM
