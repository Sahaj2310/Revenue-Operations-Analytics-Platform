import React from 'react';

export interface MonthlyRevenue {
    month: string;
    revenue: number;
}

export interface CustomerStats {
    customer_name: string;
    revenue: number;
}

export interface StatsResponse {
    total_revenue: number;
    monthly_revenue: MonthlyRevenue[];
    top_customers: CustomerStats[];
}

export interface ForecastResponse {
    historical: MonthlyRevenue[];
    forecast: MonthlyRevenue[];
}

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
}

export interface CategoryData {
    name: string;
    value: number;
}

export interface Transaction {
    id: number;
    customer: string;
    amount: number;
    date: string;
    category: string;
}

export interface SparklinePoint {
    date: string;
    value: number;
}

export interface AdvancedAnalyticsResponse {
    mrr: number;
    active_customers: number;
    arpu: number;
    growth_rate: number;
    category_split: CategoryData[];
    recent_transactions: Transaction[];
    sparkline: SparklinePoint[];
}
