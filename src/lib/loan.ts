/**
 * Calculate EMI (Equated Monthly Installment) for a loan
 * @param principal The loan amount
 * @param annualInterestRate Annual interest rate (in percentage)
 * @param tenureInMonths Loan tenure in months
 * @returns Monthly EMI amount
 */
export function calculateEMI(
  principal: number,
  annualInterestRate: number,
  tenureInMonths: number
): number {
  // Convert annual interest rate to monthly rate (percentage)
  const monthlyRate = annualInterestRate / 12 / 100;
  
  // Calculate EMI using the formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
  // where P = Principal, r = Monthly interest rate, n = Total number of months
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths)) / 
              (Math.pow(1 + monthlyRate, tenureInMonths) - 1);
  
  return Math.round(emi * 100) / 100; // Round to 2 decimal places
} 