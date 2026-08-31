import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/dashboard/page.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'<span className="metric-label">Characters Synthesized</span>\s*<h3 className="metric-number">45,210</h3>',
                 r'<span className="metric-label">Characters Synthesized</span>\n              <h3 className="metric-number">{analytics?.metrics?.totalCharsUsedInPeriod?.toLocaleString() || "0"}</h3>', content)

content = re.sub(r'<span className="metric-label">Voices Configured</span>\s*<h3 className="metric-number">12 Saved</h3>\s*<span className="metric-subtext">5 standard, 7 clones</span>',
                 r'<span className="metric-label">Voices Configured</span>\n              <h3 className="metric-number">{analytics?.charts?.voiceTrends?.length || 0} Active</h3>\n              <span className="metric-subtext">Recently used</span>', content)

content = re.sub(r'<span className="metric-label">Active Projects</span>\s*<h3 className="metric-number">4 Projects</h3>',
                 r'<span className="metric-label">Generations</span>\n              <h3 className="metric-number">{analytics?.metrics?.totalGenerations?.toLocaleString() || "0"} Audio Clips</h3>', content)

content = re.sub(r'<span className="metric-label">Remaining Balance</span>\s*<h3 className="metric-number">54,790 Chars</h3>',
                 r'<span className="metric-label">Remaining Quota</span>\n              <h3 className="metric-number">{analytics?.subscription?.remaining?.toLocaleString() || "100,000"} Chars</h3>', content)

with open('d:/VoiceNova/04-frontend/src/app/(console)/dashboard/page.tsx', 'w') as f:
    f.write(content)
