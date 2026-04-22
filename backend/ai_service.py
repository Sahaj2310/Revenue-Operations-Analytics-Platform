import os
from google import genai
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
client = None

if API_KEY:
    client = genai.Client(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in .env. AI Generation will fail.")

# Retry logic: Up to 5 attempts, exponential backoff starting at 2s
ai_retry = retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=2, min=2, max=60),
    reraise=True
)

def get_model_name(attempt=0):
    """
    Returns the model name. Can be used for rotating models if needed.
    """
    # Primary model: 2.5-flash. Fallback: 2.0-flash for stability if needed.
    # In this environment, we'll stick to a more stable 'latest' alias if 2.5 is busy.
    if attempt > 2:
        return 'models/gemini-2.0-flash'
    return 'models/gemini-2.5-flash'

@ai_retry
def generate_personalized_pitch(
    customer_name: str, 
    total_revenue: float, 
    transaction_count: int,
    recent_transactions: list,
    churn_risk: str, 
    churn_reason: str
) -> str:
    """
    Uses Gemini AI to generate a personalized sales pitch or retention email based on metrics.
    """
    if not client:
        raise ValueError("GEMINI_API_KEY is not configured.")
    
    # Format recent transactions for the prompt
    tx_summary = "\n".join([
        f"- {tx['date']}: {tx['category'].title()} (${tx['amount']:.2f})"
        for tx in recent_transactions[:5]  # Limit to 5 recent
    ])

    # Dynamic tone adjustment based on risk
    tone_instruction = ""
    if churn_risk == "High Risk":
        tone_instruction = "The tone should be empathetic, checking in on them, and attempting to re-engage them with a check-in call or a special offer since they haven't been active recently."
    elif churn_risk == "Low Risk":
        tone_instruction = "The tone should be appreciative, acknowledging their loyalty, and subtly upselling or recommending a complementary service based on their history."
    else:
        tone_instruction = "The tone should be professional and forward-looking, seeking to maintain the relationship and potentially book a brief alignment meeting."

    # Construct the prompt
    prompt = f"""
    You are an expert sales and customer success manager.
    Please draft a highly personalized, professional business email to our client, {customer_name}.

    Here is the client's data context:
    - Total Historical Revenue: ${total_revenue:.2f}
    - Total Transactions: {transaction_count}
    - Recent Activity:
    {tx_summary if tx_summary else "- No recent transactions available."}
    - Current AI Churn Risk Status: {churn_risk} ({churn_reason})

    Instructions:
    1. {tone_instruction}
    2. Reference their specific recent activity or total relationship value to show we know them.
    3. Keep the email concise (2-3 short paragraphs max).
    4. Include a clear, low-friction Call to Action (e.g., a 10-minute check-in call).
    5. Do NOT use placeholder brackets like [Your Name] or [Company Name]. Sign off generically as "The Success Team".

    Write the email now:
    """

    try:
        response = client.models.generate_content(
            model='models/gemini-flash-latest',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise ValueError("Failed to generate AI content.")

@ai_retry
def generate_executive_summary(
    total_revenue: float,
    active_customers: int,
    arpu: float,
    growth_rate: float,
    time_range_label: str,
    top_customers: list
) -> str:
    """
    Uses Gemini AI to generate a 3-sentence executive summary for the PDF report.
    """
    if not client:
        return "AI Summary unavailable: No API Key configured."
        
    top_cust_str = ", ".join([f"{c['customer_name']} (${c['revenue']:,.2f})" for c in top_customers[:3]])
        
    prompt = f"""
    You are an expert Data Analyst and Chief Revenue Officer.
    Write a concisely worded, 3-sentence Executive Summary analyzing the following performance data for the {time_range_label} period:
    
    - Total Revenue: ${total_revenue:,.2f}
    - Active Customers: {active_customers}
    - Revenue Growth Rate: {growth_rate:.2f}%
    - Average Revenue Per User (ARPU): ${arpu:,.2f}
    - Top 3 Customers: {top_cust_str if top_cust_str else "None"}

    Instructions:
    1. Keep it professional, objective, and strictly 3 sentences.
    2. Highlight the most impressive metric or address the growth rate.
    3. Conclude with a quick recommendation or observation based ONLY on this data.
    4. Do not use generic placeholders.
    """

    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini Summary Error: {e}")
        return "AI Summary generation failed due to an error."

@ai_retry
def translate_query_to_sql(user_query: str) -> dict:
    """
    Translates a natural language user query into a SQL query.
    Returns a dictionary with 'explanation', 'sql', and 'visual_hint'.
    """
    if not client:
        raise ValueError("GEMINI_API_KEY is not configured.")

    schema_context = """
    Table Name: revenuedata
    Columns:
    - id (integer, primary key)
    - date (datetime)
    - amount (float)
    - customer_name (string)
    - category (string)
    - user_id (integer, foreign key)
    """

    prompt = f"""
    You are a RevOps Data Expert. Your task is to translate a user's natural language question into a standard SQL query based on the schema below.

    SCHEMA:
    {schema_context}

    USER QUESTION: "{user_query}"

    IMPORTANT INSTRUCTIONS:
    1. The query MUST be a SELECT statement. Never update or delete.
    2. ALWAYS include 'WHERE user_id = [USER_ID_HINT]' in your logic (the backend will replace [USER_ID_HINT] with the actual ID).
    3. Return ONLY a valid JSON object with the following keys:
       - "explanation": A brief, friendly explanation of how you are answering the question.
       - "sql": The raw SQL query. Use standard SQL syntax. Use "revenuedata" as the table name.
       - "visual_hint": Choose one from: "table", "bar_chart", "line_chart", "kpi".
    4. For date filtering, use standard date strings or intervals (e.g., CURRENT_DATE).
    5. If the question cannot be answered with this schema, return an explanation and an empty string for the SQL.

    EXAMPLE JSON RESPONSE:
    {{
      "explanation": "I'll find your top 5 customers by total revenue.",
      "sql": "SELECT customer_name, SUM(amount) as total_revenue FROM revenuedata WHERE user_id = [USER_ID_HINT] GROUP BY customer_name ORDER BY total_revenue DESC LIMIT 5",
      "visual_hint": "bar_chart"
    }}

    Response (JSON ONLY):
    """

    try:
        response = client.models.generate_content(
            model='models/gemini-flash-latest',
            contents=prompt,
            config={
                'response_mime_type': 'application/json'
            }
        )
        import json
        return json.loads(response.text.strip())
    except Exception as e:
        print(f"Gemini Copilot Error: {e}")
        raise e
