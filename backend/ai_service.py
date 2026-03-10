import os
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
client = None

if API_KEY:
    client = genai.Client(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY not found in .env. AI Generation will fail.")

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
            model='gemini-2.5-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise ValueError("Failed to generate AI content.")

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
