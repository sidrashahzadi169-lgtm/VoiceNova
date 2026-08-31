import re

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'r') as f:
    content = f.read()

bad = '''const processCheckout = async () => {
    if (paymentMethod === "stripe" || paymentMethod === "paypal") {
      showToast(${paymentMethod.toUpperCase()} API keys are missing in Vercel Environment Variables. Only Easypaisa is available in manual mode., "error");
      return;
    }
    
    if (paymentMethod === "easypaisa" && tid.length < 5) {
      showToast("Please enter a valid Easypaisa Transaction ID (TID).", "error");
      return;
    }

    showToast(Verifying payment and upgrading to \...);'''

good = '''const processCheckout = async () => {
    if (paymentMethod === "stripe" || paymentMethod === "paypal") {
      showToast(paymentMethod.toUpperCase() + " API keys are missing in Vercel Environment Variables. Only Easypaisa is available in manual mode.", "error");
      return;
    }
    
    if (paymentMethod === "easypaisa" && tid.length < 5) {
      showToast("Please enter a valid Easypaisa Transaction ID (TID).", "error");
      return;
    }

    showToast("Verifying payment and upgrading to " + selectedPlan + "...");'''

content = content.replace(bad, good)

# Fix the last trailing backtick issue in Verifying if it exists
content = re.sub(r'showToast\(Verifying payment and upgrading to \$\{selectedPlan\}\.\.\.\);', 'showToast("Verifying payment and upgrading to " + selectedPlan + "...");', content)
content = re.sub(r'showToast\(\\Verifying payment and upgrading to \$\{selectedPlan\}\.\.\.\);', 'showToast("Verifying payment and upgrading to " + selectedPlan + "...");', content)

with open('d:/VoiceNova/04-frontend/src/app/(console)/billing/page.tsx', 'w') as f:
    f.write(content)

print("Rewritten processCheckout")
