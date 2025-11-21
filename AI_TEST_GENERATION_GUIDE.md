# 🤖 AI Test Generation Guide

**Last Updated**: November 21, 2025  
**Feature Status**: ✅ Production Ready

---

## Overview

The AI Test Generation feature uses OpenAI's GPT models (or Anthropic's Claude) to automatically generate comprehensive test steps for your web applications. Simply provide a URL and description, and the AI will create intelligent test steps.

---

## ✨ Features

### 🎯 Intelligent Test Generation
- **Smart Step Creation**: AI analyzes your description and generates relevant test steps
- **Multiple Test Types**: Supports clicks, inputs, assertions, screenshots, and more
- **Context-Aware**: Understands common UI patterns (login, forms, navigation)
- **Flexible Selectors**: Generates CSS selectors for various elements

### 🔧 Provider Support
- **OpenAI**: GPT-4o-mini (default), GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Auto Mode**: Automatically selects available provider
- **Fallback**: Mock generator if no API keys configured

### 💎 Beautiful UI
- **Gradient Design**: Purple/pink gradient matching the app theme
- **Modal Interface**: Clean, focused test generation experience
- **Real-time Feedback**: Loading states and success animations
- **Step Counter**: Shows how many steps were generated

---

## 🚀 How to Use

### Step 1: Access Test Creation
1. Navigate to **Dashboard**
2. Click **"New Test"** or **"Create Your First Test"**

### Step 2: Fill Basic Information
1. **Test Name**: Give your test a descriptive name
2. **Target URL**: Enter the URL you want to test (required for AI generation)
3. **Device Profile**: Choose Desktop, Mobile, or Tablet

### Step 3: Generate with AI
1. Look for the **purple gradient banner** at the top
2. Click the **"Generate"** button
3. A modal will appear

### Step 4: Describe Your Test
In the modal:
1. **Enter Description**: Describe what you want to test
   - Example: "Test login flow with email and password"
   - Example: "Verify homepage loads and navigation works"
   - Example: "Test product search and filter functionality"
2. Click **"Generate Steps"**

### Step 5: Wait for Generation
- AI will analyze your URL and description
- Typical generation time: 2-5 seconds
- You'll see a loading spinner

### Step 6: Success!
- ✅ Success message with step count
- Generated steps are ready to use
- Modal auto-closes after 1.5 seconds

### Step 7: Save and Edit
1. Click **"Save Test"**
2. You'll be redirected to the test editor
3. Review and customize the generated steps
4. Add more steps manually if needed

---

## 🎨 AI Generation Modal

### Features
- **Backdrop Blur**: Modern glassmorphism effect
- **Icon Header**: AI lightbulb icon with gradient background
- **Text Area**: Multi-line description input
- **Helper Text**: Tips for better AI generation
- **Action Buttons**:
  - **Cancel**: Close without generating
  - **Generate Steps**: Trigger AI generation (disabled if no URL)

### States
1. **Input**: Initial state for entering description
2. **Loading**: Spinning animation while AI generates
3. **Success**: Green checkmark with step count
4. **Error**: Red error message if generation fails

---

## 📝 Generated Test Steps

### Step Types
The AI can generate various test step types:

| Type | Description | Example |
|------|-------------|---------|
| `waitForSelector` | Wait for element to appear | Wait for page body |
| `click` | Click an element | Click login button |
| `input` | Type into a field | Enter email address |
| `select` | Choose from dropdown | Select country |
| `screenshot` | Capture screenshot | Take initial screenshot |
| `assert` | Verify conditions | Check heading exists |
| `scroll` | Scroll page | Scroll to footer |
| `extract` | Extract text/data | Get product name |
| `dragAndDrop` | Drag element | Drag slider |
| `fileUpload` | Upload files | Upload profile picture |

### Example Generated Steps

```json
[
  {
    "orderIndex": 0,
    "type": "waitForSelector",
    "selector": "body",
    "description": "Wait for page to load"
  },
  {
    "orderIndex": 1,
    "type": "screenshot",
    "description": "Take initial screenshot"
  },
  {
    "orderIndex": 2,
    "type": "input",
    "selector": "input[type='email']",
    "value": "test@example.com",
    "description": "Enter email address"
  },
  {
    "orderIndex": 3,
    "type": "input",
    "selector": "input[type='password']",
    "value": "password123",
    "description": "Enter password"
  },
  {
    "orderIndex": 4,
    "type": "click",
    "selector": "button[type='submit']",
    "description": "Click login button"
  },
  {
    "orderIndex": 5,
    "type": "assert",
    "selector": "h1.dashboard-title",
    "assertionType": "exists",
    "description": "Verify dashboard heading exists"
  },
  {
    "orderIndex": 6,
    "type": "screenshot",
    "description": "Take final screenshot"
  }
]
```

---

## ⚙️ Configuration

### Environment Variables

Set these in your Railway dashboard or `.env.local`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # Your OpenAI API key
OPENAI_MODEL=gpt-4o-mini                 # Model to use (optional, default: gpt-4o-mini)

# Anthropic Configuration (alternative)
ANTHROPIC_API_KEY=sk-ant-...             # Your Anthropic API key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Model to use (optional)
```

### Provider Selection

The AI generator automatically selects the best available provider:

1. **Auto Mode** (default):
   - Checks for `OPENAI_API_KEY` first
   - Falls back to `ANTHROPIC_API_KEY`
   - Uses mock generator if neither available

2. **Manual Selection**:
   - Pass `provider: 'openai'` or `provider: 'anthropic'` in API call
   - Useful for testing specific providers

---

## 💡 Tips for Better Generation

### 1. Be Specific
❌ **Bad**: "Test the website"  
✅ **Good**: "Test user registration with email validation and password confirmation"

### 2. Include Key Actions
❌ **Bad**: "Check login"  
✅ **Good**: "Test login flow: enter credentials, click submit, verify dashboard loads"

### 3. Mention Assertions
❌ **Bad**: "Click buttons"  
✅ **Good**: "Click submit button and verify success message appears"

### 4. Describe Flow
❌ **Bad**: "Test page"  
✅ **Good**: "Navigate to products page, search for 'laptop', filter by price, verify results"

### 5. Include Context
❌ **Bad**: "Test form"  
✅ **Good**: "Test contact form: fill name, email, message, verify submission confirmation"

---

## 🔍 Technical Details

### API Endpoint
```
POST /api/tests/generate
```

### Request Body
```json
{
  "targetUrl": "https://example.com",
  "description": "Test login flow with email and password",
  "provider": "auto",  // optional: "openai" | "anthropic" | "auto"
  "apiKey": "sk-..."   // optional: override env variable
}
```

### Response
```json
{
  "steps": [
    {
      "orderIndex": 0,
      "type": "waitForSelector",
      "selector": "body",
      "description": "Wait for page to load"
    }
  ],
  "message": "Test steps generated successfully",
  "provider": "openai"
}
```

### Error Handling
- **Network Errors**: Falls back to mock generator
- **API Errors**: Returns mock steps with error log
- **Invalid Response**: Attempts JSON extraction from markdown
- **No API Key**: Uses mock generator automatically

---

## 🎯 Use Cases

### 1. Quick Prototyping
Generate initial test structure in seconds, then refine manually.

### 2. Learning Tool
See how AI suggests test steps for various scenarios.

### 3. Consistent Structure
Get well-structured tests following best practices.

### 4. Time Saving
Reduce manual test creation time by 70-80%.

### 5. Coverage Ideas
Discover test scenarios you might have missed.

---

## 🔄 Workflow Integration

### Standard Workflow
1. **Generate** → AI creates initial steps
2. **Review** → Check generated steps
3. **Customize** → Add/modify/remove steps
4. **Save** → Store test configuration
5. **Run** → Execute automated tests
6. **Analyze** → Review results and reports

### Advanced Workflow
1. **Generate multiple variants** for different scenarios
2. **Combine** AI-generated and manual steps
3. **Template creation** from successful AI generations
4. **Iteration** with different descriptions
5. **A/B testing** different test approaches

---

## 📊 Pricing & Limits

### OpenAI Costs (approximate)
- **GPT-4o-mini**: ~$0.0001 per test generation
- **GPT-4**: ~$0.01 per test generation
- **GPT-3.5-turbo**: ~$0.0001 per test generation

### Anthropic Costs (approximate)
- **Claude 3.5 Sonnet**: ~$0.002 per test generation
- **Claude 3 Opus**: ~$0.005 per test generation

### Rate Limits
- Follows your API provider's rate limits
- No additional limits from our application
- Recommend caching results to save costs

---

## 🐛 Troubleshooting

### Issue: "Failed to generate test steps"
**Solutions**:
- Check API key is set correctly
- Verify API key has sufficient credits
- Check internet connection
- Try different provider

### Issue: No URL validation
**Solution**:
- Enter Target URL first before clicking Generate
- URL must be valid format (https://...)

### Issue: Generated steps don't match needs
**Solutions**:
- Provide more detailed description
- Include specific element selectors
- Mention exact flow steps
- Try generating again with refined description

### Issue: Modal doesn't close
**Solution**:
- Click X button or Cancel
- Steps are still saved even if modal stays open
- Refresh page if needed

---

## 🔐 Security

### API Key Storage
- Environment variables (recommended)
- Never commit API keys to version control
- Use Railway's environment variable manager
- Rotate keys periodically

### Data Privacy
- Test descriptions sent to AI provider
- Target URLs included in prompts
- No sensitive data stored by our app
- AI providers may log requests (check their policies)

### Best Practices
- Don't include passwords in test descriptions
- Use test accounts for generated tests
- Review generated steps before running
- Keep API keys secure

---

## 📈 Future Enhancements

### Planned Features
- [ ] Screenshot analysis for better selector generation
- [ ] Multi-page test flow generation
- [ ] Visual element detection
- [ ] Test optimization suggestions
- [ ] Custom prompt templates
- [ ] Batch test generation
- [ ] Integration with CI/CD
- [ ] Cost tracking dashboard

---

## 🎓 Examples

### Example 1: E-commerce Search
**Description**: "Test product search: search for 'laptop', apply price filter, verify results display"

**Generated Steps**:
1. Wait for search input
2. Type "laptop" in search
3. Click search button
4. Wait for results
5. Click price filter
6. Select price range
7. Assert results updated
8. Take screenshot

### Example 2: Form Submission
**Description**: "Test contact form with name, email, message, and verify success"

**Generated Steps**:
1. Wait for form
2. Input name field
3. Input email field
4. Input message textarea
5. Click submit
6. Assert success message
7. Screenshot confirmation

### Example 3: Navigation Test
**Description**: "Test main navigation: verify all menu items clickable and load correctly"

**Generated Steps**:
1. Wait for navigation
2. Click Home link
3. Assert home page loaded
4. Click About link
5. Assert about page loaded
6. Click Contact link
7. Assert contact page loaded

---

## 🆘 Support

### Documentation
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Playwright Selectors](https://playwright.dev/docs/selectors)

### Getting Help
- Check this guide first
- Review generated steps in test editor
- Try different descriptions
- Use mock generator for testing
- Contact support if issues persist

---

**Happy Testing with AI! 🚀✨**

