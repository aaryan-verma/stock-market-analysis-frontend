import React from 'react';

interface PDFTemplateProps {
  symbol: string;
  plotImage?: string;
  report: any;
}

export const generatePDFTemplate = ({ symbol, plotImage, report }: PDFTemplateProps): string => {
  return `
    <div id="pdfTemplate" style="width: 210mm; padding: 15mm; font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.5; box-sizing: border-box;">
      <!-- Header Section with Logo and Title -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
          <h1 style="color: #2563eb; margin: 0 0 0 10px; font-size: 24px; font-weight: 700;">AI STOCK ANALYSIS</h1>
        </div>
        <h2 style="color: #1e40af; margin: 0; font-size: 32px; font-weight: 700;">${symbol}</h2>
        <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        <div style="margin: 10px auto; border-bottom: 2px solid #e5e7eb; width: 80%;"></div>
      </div>
      
      <!-- Chart Image Section (if available) -->
      ${plotImage ? `
      <div style="margin-bottom: 20px; text-align: center;">
        <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; text-align: left;">TECHNICAL ANALYSIS CHART</h3>
        <img src="${plotImage}" alt="Stock Analysis Chart" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #e5e7eb;">
      </div>
      ` : ''}
      
      <!-- Market Outlook Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; 
                  background-color: ${report.market_outlook === 'bullish' ? '#dcfce7' : report.market_outlook === 'bearish' ? '#fee2e2' : '#fef9c3'}; 
                  padding: 12px 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid ${
                    report.market_outlook === 'bullish' ? '#86efac' : 
                    report.market_outlook === 'bearish' ? '#fca5a5' : '#fde68a'
                  };">
        <div>
          <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #4b5563;">MARKET OUTLOOK</h3>
          <p style="margin: 5px 0 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${
            report.market_outlook === 'bullish' ? '#16a34a' : 
            report.market_outlook === 'bearish' ? '#dc2626' : '#ca8a04'
          };">${report.market_outlook || 'N/A'}</p>
        </div>
        <div style="text-align: right; background-color: white; padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Confidence Level</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${
            report.confidence >= 80 ? '#16a34a' : 
            report.confidence >= 60 ? '#0891b2' : 
            report.confidence >= 40 ? '#ca8a04' : '#dc2626'
          };">${report.confidence || 'N/A'}%</p>
        </div>
      </div>
      
      <!-- Price Interpretation Section - Highlighted -->
      <div style="margin-bottom: 20px; background-color: #f8fafc; border-left: 6px solid #2563eb; padding: 12px 15px; border-radius: 5px;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">PRICE INTERPRETATION</h3>
        <p style="font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-line; color: #334155;">${report.price_interpretation || 'No interpretation available'}</p>
      </div>
      
      <!-- Price Levels Section - Tabular Format -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">KEY PRICE LEVELS</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 50%;">RESISTANCE LEVELS</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 50%;">SUPPORT LEVELS</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.key_levels_to_watch?.filter((level: string) => level.includes('R')).map((level: string) => {
                  // Check if the level already contains a colon
                  if (level.includes(':')) {
                    const [label, value] = level.split(':').map(part => part.trim());
                    return `<li style="margin-bottom: 8px; color: #16a34a; display: flex; align-items: baseline;">
                      <span style="min-width: 30px; display: inline-block; font-weight: 600;">${label}</span>
                      <span style="margin-left: 5px;">${value}</span>
                    </li>`;
                  } else {
                    // If no colon, just display the level as is
                    return `<li style="margin-bottom: 8px; color: #16a34a; display: flex; align-items: baseline;">
                      <span>${level}</span>
                    </li>`;
                  }
                }).join('') || '<li>No resistance levels available</li>'}
              </ul>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.key_levels_to_watch?.filter((level: string) => level.includes('S')).map((level: string) => {
                  // Check if the level already contains a colon
                  if (level.includes(':')) {
                    const [label, value] = level.split(':').map(part => part.trim());
                    return `<li style="margin-bottom: 8px; color: #dc2626; display: flex; align-items: baseline;">
                      <span style="min-width: 30px; display: inline-block; font-weight: 600;">${label}</span>
                      <span style="margin-left: 5px;">${value}</span>
                    </li>`;
                  } else {
                    // If no colon, just display the level as is
                    return `<li style="margin-bottom: 8px; color: #dc2626; display: flex; align-items: baseline;">
                      <span>${level}</span>
                    </li>`;
                  }
                }).join('') || '<li>No support levels available</li>'}
              </ul>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Add vertical spacing between sections -->
      <div style="height: 80px;"></div>
      
      <!-- Price Targets Section - Tabular Format -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">PRICE TARGETS</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; color: #16a34a; width: 50%;">UPSIDE TARGETS</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; color: #dc2626; width: 50%;">DOWNSIDE TARGETS</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top; background-color: #f0fdf4;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.upside_targets?.map((target: string) => {
                  // Check if the target already contains a colon
                  if (target.includes(':')) {
                    const [label, value] = target.split(':').map(part => part.trim());
                    return `<li style="margin-bottom: 8px; font-weight: 500; display: flex; align-items: baseline;">
                      <span style="min-width: 120px; display: inline-block;">${label}</span>
                      <span>${value}</span>
                    </li>`;
                  } else {
                    // If no colon, just display the target as is
                    return `<li style="margin-bottom: 8px; font-weight: 500; display: flex; align-items: baseline;">
                      <span>${target}</span>
                    </li>`;
                  }
                }).join('') || '<li>No upside targets available</li>'}
              </ul>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top; background-color: #fef2f2;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.downside_targets?.map((target: string) => {
                  // Check if the target already contains a colon
                  if (target.includes(':')) {
                    const [label, value] = target.split(':').map(part => part.trim());
                    return `<li style="margin-bottom: 8px; font-weight: 500; display: flex; align-items: baseline;">
                      <span style="min-width: 120px; display: inline-block;">${label}</span>
                      <span>${value}</span>
                    </li>`;
                  } else {
                    // If no colon, just display the target as is
                    return `<li style="margin-bottom: 8px; font-weight: 500; display: flex; align-items: baseline;">
                      <span>${target}</span>
                    </li>`;
                  }
                }).join('') || '<li>No downside targets available</li>'}
              </ul>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Entry/Exit Points - Tabular Format -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">TRADING STRATEGY</h3>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 33%;">ENTRY POINTS</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 33%;">EXIT POINTS</th>
            <th style="padding: 10px; border: 1px solid #cbd5e1; width: 33%;">STOP LOSS LEVELS</th>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.entry_points?.map((entry: string) => 
                  `<li style="margin-bottom: 8px; display: flex; align-items: baseline;">
                    <span style="display: inline-block;">${entry}</span>
                  </li>`).join('') || '<li>No entry points available</li>'}
              </ul>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.exit_points?.map((exit: string) => 
                  `<li style="margin-bottom: 8px; display: flex; align-items: baseline;">
                    <span style="display: inline-block;">${exit}</span>
                  </li>`).join('') || '<li>No exit points available</li>'}
              </ul>
            </td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; vertical-align: top;">
              <ul style="padding-left: 20px; margin: 0; list-style-type: disc;">
                ${report.stop_loss_recommendations?.map((stop: string) => 
                  `<li style="margin-bottom: 8px; display: flex; align-items: baseline;">
                    <span style="display: inline-block;">${stop}</span>
                  </li>`).join('') || '<li>No stop loss recommendations available</li>'}
              </ul>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Risk Assessment Section -->
      <div style="margin-bottom: 20px; display: flex; gap: 20px;">
        <div style="flex: 1;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">RISK ASSESSMENT</h3>
          <div style="padding: 15px; background-color: #f8fafc; border-radius: 5px; border-left: 4px solid #64748b; font-size: 16px;">
            <p style="margin: 0; font-weight: 500;">${report.risk_assessment || 'No risk assessment available'}</p>
          </div>
        </div>
      </div>
      
      <!-- Trading Opportunities Section -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">TRADING OPPORTUNITIES</h3>
        <ul style="padding-left: 20px; margin: 0; list-style-type: disc; font-size: 16px;">
          ${report.trading_opportunities?.map((opportunity: string) => 
            `<li style="margin-bottom: 10px; padding: 5px 0; display: flex; align-items: baseline;">
              <span style="display: inline-block;">${opportunity}</span>
            </li>`).join('') || '<li>No trading opportunities available</li>'}
        </ul>
      </div>
      
      <!-- Disclaimer Section -->
      <div style="margin-top: 30px; padding: 12px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #64748b;">
        <p style="margin: 0 0 3px 0;"><strong>DISCLAIMER:</strong> This report is generated using AI analysis and should be used for informational purposes only.</p>
        <p style="margin: 0 0 3px 0;">All trading decisions should be made after conducting your own research and analysis.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Stock Market Analysis Tool | ${symbol} Analysis Report</p>
      </div>
    </div>
  `;
};

export default generatePDFTemplate; 