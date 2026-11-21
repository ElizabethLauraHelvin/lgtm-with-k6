# Corrected K6 -> JMeter JTL

Use `k6-login-results-fixed.jtl` as the Results file in JMeter 5.6.3.

Correction made:
- The source `elapsed` values are milliseconds but include decimal fractions (e.g. 5.169).
- JMeter's JTL CSV parser expects `elapsed` as an integer (`long`).
- The corrected file rounds elapsed to the nearest whole millisecond (5.169 -> 5).
- No missing bytes, latency, connect-time, or active-thread values have been invented.

Generate report:
- Results file: full path to `k6-login-results-fixed.jtl`
- user.properties: leave blank if the JMeter GUI allows it; otherwise select `C:\apache-jmeter-5.6.3\bin\user.properties`
- Output directory: an existing empty folder, e.g. `C:\Users\<you>\OneDrive\JMeter\report-fixed`

Important: This is a dashboard visualization of K6 browser sample data, not a JMeter load-test execution.
