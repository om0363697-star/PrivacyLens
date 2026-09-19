import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { SAMPLE_POLICIES } from './src/data/samplePolicies';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy GoogleGenAI initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({ status: 'ok', hasGeminiKey: hasKey });
});

// Preloaded sample policies
app.get('/api/samples', (req, res) => {
  res.json({ samples: SAMPLE_POLICIES });
});

// Firebase public configuration endpoint (safe client config)
app.get('/api/firebase-config', (req, res) => {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const parsed = JSON.parse(raw);
      return res.json({
        configured: true,
        config: {
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain,
          projectId: parsed.projectId,
          storageBucket: parsed.storageBucket,
          messagingSenderId: parsed.messagingSenderId,
          appId: parsed.appId,
          firestoreDatabaseId: parsed.firestoreDatabaseId || '(default)'
        }
      });
    }
  } catch (err) {
    console.error('Failed to load firebase config:', err);
  }
  return res.json({ configured: false, config: null });
});

// Fallback intelligent heuristic analyzer when GEMINI_API_KEY is not configured
function analyzePolicyHeuristically(text: string, serviceNameInput?: string): any {
  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutesSaved = Math.max(3, Math.round(wordCount / 180));
  
  // Extract or infer service name
  let serviceName = serviceNameInput?.trim() || 'Analyzed Service';
  if (!serviceNameInput || serviceNameInput.toLowerCase() === 'custom') {
    const firstLines = cleanText.slice(0, 500);
    const match = firstLines.match(/([A-Z][a-zA-Z0-9\s]{2,20})\s+(Privacy Policy|Privacy Notice|Terms)/i);
    if (match && match[1]) {
      serviceName = match[1].trim();
    }
  }

  const lower = cleanText.toLowerCase();

  // Detection flags
  const hasBiometrics = lower.includes('biometric') || lower.includes('faceprint') || lower.includes('voiceprint') || lower.includes('facial recognition');
  const hasSale = lower.includes('sell your personal information') || lower.includes('sale of personal data') || (lower.includes('sell') && lower.includes('data broker'));
  const hasAITraining = lower.includes('train our models') || lower.includes('machine learning') || lower.includes('train ai') || lower.includes('artificial intelligence') || lower.includes('model improvement');
  const hasKeystrokes = lower.includes('keystroke') || lower.includes('clipboard') || lower.includes('accelerometer');
  const hasPreciseLocation = lower.includes('precise location') || lower.includes('gps coordinates') || lower.includes('geolocation');
  const hasChildrenData = lower.includes('under 13') || lower.includes('children') || lower.includes('coppa');
  const hasOptOut = lower.includes('opt-out') || lower.includes('opt out') || lower.includes('unsubscribe');
  const hasDeletion = lower.includes('delete your account') || lower.includes('request deletion') || lower.includes('erasure');

  // Compute realistic risk score (0-100, where 0 is safest, 100 is highest risk)
  let riskScore = 30;
  if (hasSale) riskScore += 25;
  if (hasBiometrics) riskScore += 25;
  if (hasKeystrokes) riskScore += 15;
  if (hasAITraining) riskScore += 10;
  if (hasPreciseLocation) riskScore += 10;
  if (!hasDeletion) riskScore += 8;
  if (!hasOptOut) riskScore += 5;

  riskScore = Math.max(10, Math.min(95, riskScore));

  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (riskScore >= 66) {
    riskLevel = 'High';
  } else if (riskScore <= 35) {
    riskLevel = 'Low';
  }

  function findSnippet(keyword: string, fallback: string): string {
    const idx = lower.indexOf(keyword);
    if (idx !== -1) {
      const start = Math.max(0, cleanText.lastIndexOf('.', idx) + 1);
      const end = cleanText.indexOf('.', idx + keyword.length);
      const snippet = cleanText.substring(start, end !== -1 ? end + 1 : idx + 180).trim();
      if (snippet.length > 20) return snippet;
    }
    return fallback;
  }

  const clauses: any[] = [];

  if (hasBiometrics) {
    clauses.push({
      id: 'clause-bio',
      title: 'Biometric Identifiers Collected',
      severity: 'critical',
      category: 'Biometrics',
      clauseExcerpt: findSnippet('biometric', 'We may collect biometric identifiers, including faceprints and voiceprints, from user uploaded media.'),
      explanation: 'The service extracts biological physical identifiers such as facial geometry or voice recordings.',
      riskImpact: 'Permanent biological identification that cannot be changed if compromised.'
    });
  }

  if (hasSale) {
    clauses.push({
      id: 'clause-sale',
      title: 'Sharing with Commercial Data Brokers',
      severity: 'critical',
      category: 'Data Sale',
      clauseExcerpt: findSnippet('sell', 'We may share personal information with third-party commercial partners and ad networks for consideration.'),
      explanation: 'Your profile and browsing telemetry are made available to external advertising networks.',
      riskImpact: 'Cross-site ad tracking and behavioral profiling across unrelated websites.'
    });
  }

  if (hasAITraining) {
    clauses.push({
      id: 'clause-ai',
      title: 'User Content Utilized for AI Model Training',
      severity: 'warning',
      category: 'AI Training',
      clauseExcerpt: findSnippet('train', 'User content, queries, and uploads may be used to develop and train machine learning models.'),
      explanation: 'Your submitted content, queries, and files may be ingested by AI training datasets.',
      riskImpact: 'Information you submit may influence generative model behaviors.'
    });
  }

  if (hasKeystrokes) {
    clauses.push({
      id: 'clause-telemetry',
      title: 'Device Sensor and Typing Telemetry',
      severity: 'warning',
      category: 'Telemetry & Tracking',
      clauseExcerpt: findSnippet('keystroke', 'We monitor keystroke rhythms, clipboard copy buffers, and sensory accelerometer coordinates.'),
      explanation: 'The app monitors device motion and clipboard copy/paste buffers.',
      riskImpact: 'Temporary exposure of clipboard items or behavioral typing cadence.'
    });
  }

  if (clauses.length === 0) {
    clauses.push({
      id: 'clause-standard',
      title: 'Third-Party Analytics & Cookies',
      severity: 'info',
      category: 'Third-Party Sharing',
      clauseExcerpt: findSnippet('cookie', 'We utilize cookies and tracking pixels to analyze engagement trends and maintain service performance.'),
      explanation: 'Standard web telemetry is used to evaluate page visits and feature performance.',
      riskImpact: 'Aggregated analytics used to improve platform stability.'
    });
  }

  return {
    id: 'analysis-' + Date.now(),
    serviceName,
    companyName: serviceName + ' Inc.',
    serviceCategory: 'Technology',
    policyUrl: '',
    analyzedAt: new Date().toISOString().split('T')[0],
    readingTimeMinutesSaved,
    wordCount,
    riskScore,
    riskLevel,
    disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
    oneSentenceVerdict: `${serviceName} has an AI-generated Privacy Risk Indicator of ${riskLevel} (${riskScore}/100) based on ${clauses.length} highlighted clauses concerning data sharing, telemetry, and user controls.`,
    executiveSummary: {
      dataCollected: [
        'Account profile identifiers (name, email, login credentials)',
        'Device telemetry, operating system, IP address, and browser specs',
        hasPreciseLocation ? 'Precise GPS location coordinates' : 'Approximate location derived from IP routing',
        hasBiometrics ? 'Biometric facial or voice features' : 'Application usage metrics and interaction timestamps'
      ],
      dataShared: [
        hasSale ? 'Commercial advertising networks and marketing partners' : 'Cloud hosting, payment, and infrastructure service providers',
        'Corporate affiliates and parent company entities',
        'Regulatory or law enforcement entities when required by law'
      ],
      userControls: [
        hasDeletion ? 'In-app account deletion and data erasure option' : 'Deletion requests submitted through support contact',
        hasOptOut ? 'Personalized ad opt-out toggles in account settings' : 'Browser-level cookie preference controls',
        'Data download request portal to archive personal logs'
      ],
      humanReadableSummary: `This policy outlines standard operational data logging alongside ${hasSale || hasBiometrics ? 'notable tracking practices that warrant careful configuration' : 'moderate telemetry collection'}. Review your privacy settings to reduce tracking.`
    },
    importantClauses: clauses,
    redFlags: clauses, // backwards compatibility
    categoryBreakdown: [
      {
        category: 'Personal Identifiers',
        score: hasBiometrics ? 40 : 75,
        status: hasBiometrics ? 'Poor' : 'Good',
        icon: 'Fingerprint',
        highlights: ['Standard account registration profile'],
        concerns: hasBiometrics ? ['Collects biometric markers'] : ['Links profile with device identifiers']
      },
      {
        category: 'Tracking & Telemetry',
        score: hasKeystrokes ? 38 : 68,
        status: hasKeystrokes ? 'Poor' : 'Moderate',
        icon: 'Smartphone',
        highlights: ['Session diagnostics and crash reporting'],
        concerns: hasKeystrokes ? ['Clipboard or sensor telemetry'] : ['Cross-domain analytical tracking']
      },
      {
        category: 'Third-Party Sharing',
        score: hasSale ? 32 : 80,
        status: hasSale ? 'Poor' : 'Good',
        icon: 'Share2',
        highlights: hasSale ? [] : ['No explicit selling of personal data to external brokers'],
        concerns: hasSale ? ['Data shared with ad networks for consideration'] : ['Shared with infrastructure partners']
      },
      {
        category: 'AI & Machine Learning',
        score: hasAITraining ? 55 : 90,
        status: hasAITraining ? 'Moderate' : 'Good',
        icon: 'Cpu',
        highlights: hasAITraining ? ['Algorithmic quality optimization'] : ['User content not ingested for AI model training'],
        concerns: hasAITraining ? ['Prompts or uploaded media used for model retraining'] : []
      },
      {
        category: 'Retention & User Controls',
        score: hasDeletion ? 82 : 48,
        status: hasDeletion ? 'Good' : 'Poor',
        icon: 'ShieldCheck',
        highlights: ['Data download export available in settings'],
        concerns: ['Backups may be preserved for regulatory reporting']
      }
    ],
    dataRetention: {
      retainedAfterAccountDeletion: true,
      retentionPeriod: 'Maintained for operational necessity, fraud prevention, and audit obligations.',
      summary: 'Active profile details are deactivated, while anonymized logs and transactional records remain preserved in backups.'
    },
    thirdPartySharing: {
      sellsDataToBrokers: hasSale,
      sharesWithAdvertisers: true,
      sharesWithAffiliates: true,
      governmentDisclosurePolicy: 'Discloses records in response to lawful legal process or valid subpoenas.',
      identifiedPartners: ['Cloud Infrastructure Providers', 'Analytics SDKs', 'Payment Processors']
    },
    optOutGuidance: {
      hasDataDownloadTool: true,
      hasAccountDeletionOption: hasDeletion,
      steps: [
        {
          step: 1,
          action: 'Turn Off Personalized Advertising',
          description: 'Open in-app settings under Privacy or Preferences and toggle off third-party ad profiling.'
        },
        {
          step: 2,
          action: 'Limit Device Permissions',
          description: 'Set device location to "While Using" or "Never", and revoke camera or microphone access when not needed.'
        },
        {
          step: 3,
          action: 'Download Personal Data Archive',
          description: 'Visit the account settings export portal to download a copy of stored account information.'
        }
      ]
    },
    rawPolicyExcerpt: cleanText.slice(0, 1500),
    plainLanguageSummary: `This policy outlines standard operational data logging alongside ${hasSale || hasBiometrics ? 'notable tracking practices that warrant careful configuration' : 'moderate telemetry collection'}. Review your privacy settings to reduce tracking.`,
    findings: {
      dataCollected: {
        title: 'Data Collected',
        status: 'Detected',
        items: [
          'Account profile identifiers (name, email, login credentials)',
          'Device telemetry, operating system, IP address, and browser specs',
          hasPreciseLocation ? 'Precise GPS location coordinates' : 'Approximate location derived from IP routing'
        ],
        excerpt: findSnippet('collect', cleanText.slice(0, 200))
      },
      sensitiveData: {
        title: 'Sensitive Data',
        status: hasBiometrics ? 'Detected' : 'Not Mentioned',
        items: hasBiometrics ? ['Biometric facial or voice markers'] : [],
        excerpt: hasBiometrics ? findSnippet('biometric', 'We may collect biometric identifiers.') : undefined
      },
      dataSharing: {
        title: 'Data Sharing',
        status: hasSale ? 'Detected' : 'Not Mentioned',
        items: hasSale ? ['Commercial data brokers', 'External advertising networks'] : [],
        excerpt: hasSale ? findSnippet('sell', 'We may share personal information with third parties.') : undefined
      },
      thirdParties: {
        title: 'Third Parties',
        status: 'Detected',
        items: ['Cloud Infrastructure Providers', 'Analytics SDKs', 'Payment Processors'],
        excerpt: findSnippet('third party', 'We disclose information to trusted vendors and service providers.')
      },
      trackingCookies: {
        title: 'Tracking & Cookies',
        status: hasKeystrokes || lower.includes('cookie') ? 'Detected' : 'Not Mentioned',
        items: [
          lower.includes('cookie') ? 'Browser cookies and session tokens' : 'Standard session diagnostics',
          hasKeystrokes ? 'Sensor and typing telemetry' : 'Performance monitoring'
        ],
        excerpt: findSnippet('cookie', 'We utilize cookies and tracking pixels to analyze engagement trends.')
      },
      cookies: {
        title: 'Cookies',
        status: lower.includes('cookie') ? 'Detected' : 'Not Mentioned',
        items: lower.includes('cookie') ? ['Session and analytics cookies'] : [],
        excerpt: findSnippet('cookie', 'We utilize cookies to maintain service performance.')
      },
      tracking: {
        title: 'Tracking',
        status: hasKeystrokes ? 'Detected' : 'Not Mentioned',
        items: hasKeystrokes ? ['Keystrokes and sensor coordinates'] : [],
        excerpt: hasKeystrokes ? findSnippet('keystroke', 'We monitor interaction metrics.') : undefined
      },
      dataRetention: {
        title: 'Data Retention',
        status: 'Detected',
        items: ['Maintained during account lifetime and for fraud prevention obligations.'],
        excerpt: findSnippet('retain', 'Data is stored for operational necessity and compliance purposes.')
      },
      userRights: {
        title: 'User Rights',
        status: hasDeletion || hasOptOut ? 'Detected' : 'Not Mentioned',
        items: [
          hasDeletion ? 'Account deletion request' : 'Support inquiry deletion',
          hasOptOut ? 'Advertising opt-out' : 'Cookie preferences',
          'Data export archive'
        ],
        excerpt: hasDeletion ? findSnippet('delete', 'You may request deletion of your account.') : undefined
      },
      security: {
        title: 'Security',
        status: lower.includes('encrypt') || lower.includes('security') ? 'Detected' : 'Not Mentioned',
        items: ['Industry-standard encryption in transit and at rest', 'Access controls'],
        excerpt: findSnippet('security', 'We employ administrative, technical, and physical safeguards.')
      },
      privacyConcerns: {
        title: 'Privacy Concerns',
        status: clauses.length > 0 ? 'Detected' : 'Not Mentioned',
        items: clauses.map(c => c.title),
        excerpt: clauses[0]?.clauseExcerpt
      },
      importantClauses: {
        title: 'Important Clauses',
        status: clauses.length > 0 ? 'Detected' : 'Not Mentioned',
        items: clauses.map(c => c.title),
        excerpt: clauses[0]?.clauseExcerpt
      }
    }
  };
}

// Resilient Gemini model caller: tries high-availability gemini-3.1-flash-lite first,
// with retry on transient 503/429 spikes, and silent cascade to gemini-3.8-flash and gemini-flash-latest
async function callGeminiWithFallback(ai: GoogleGenAI, prompt: string, config?: any): Promise<any> {
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        const isTransient = msg.includes('503') || msg.includes('high demand') || msg.includes('429') || msg.includes('UNAVAILABLE');
        if (isTransient && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All candidate Gemini models are temporarily unavailable.');
}

// AI Policy Analysis Endpoint
app.post('/api/analyze-policy', async (req, res) => {
  try {
    const { text, serviceName } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please paste privacy policy text to begin analysis.' });
    }
    if (text.trim().length < 50) {
      return res.status(400).json({ error: 'Policy text is too short. Please provide at least 50 characters of policy text for a meaningful analysis.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      const fallbackAnalysis = analyzePolicyHeuristically(text, serviceName);
      return res.json({ analysis: fallbackAnalysis, source: 'heuristic' });
    }

    const prompt = `You are PrivacyLens, an AI privacy-policy analysis engine.

Analyze ONLY the privacy policy text provided by the user.

Do not invent facts.
If something is not mentioned, return 'Not Mentioned'.
If the policy is ambiguous, return 'Unclear'.

Identify:
- personal data collected
- sensitive data
- purpose of collection
- data sharing
- third parties
- tracking
- cookies
- data retention
- user rights
- security practices
- potentially concerning clauses
- important clauses

Return ONLY valid JSON matching the required schema:
{
  "summary": "short plain-language summary",
  "riskIndicator": 0,
  "riskLevel": "Low",
  "dataCollected": ["item 1", "item 2"],
  "dataCollectedExcerpt": "exact quote from policy if detected",
  "sensitiveData": ["item 1"] or "Not Mentioned" or "Unclear",
  "sensitiveDataExcerpt": "exact quote from policy if detected",
  "dataSharing": ["item 1", "item 2"] or "Not Mentioned" or "Unclear",
  "dataSharingExcerpt": "exact quote from policy if detected",
  "thirdParties": ["item 1", "item 2"] or "Not Mentioned" or "Unclear",
  "thirdPartiesExcerpt": "exact quote from policy if detected",
  "tracking": ["item 1"] or "Not Mentioned" or "Unclear",
  "trackingExcerpt": "exact quote from policy if detected",
  "cookies": ["item 1"] or "Not Mentioned" or "Unclear",
  "cookiesExcerpt": "exact quote from policy if detected",
  "retention": "plain summary of retention period" or "Not Mentioned" or "Unclear",
  "retentionExcerpt": "exact quote from policy if detected",
  "userRights": ["item 1"] or "Not Mentioned" or "Unclear",
  "userRightsExcerpt": "exact quote from policy if detected",
  "security": ["item 1"] or "Not Mentioned" or "Unclear",
  "securityExcerpt": "exact quote from policy if detected",
  "concerns": ["item 1"] or "Not Mentioned" or "Unclear",
  "concernsExcerpt": "exact quote from policy if detected",
  "importantClauses": [
    {
      "title": "Title of clause",
      "severity": "critical" | "warning" | "info",
      "category": "Data Sale" | "Biometrics" | "AI Training" | "Telemetry & Tracking" | "Data Retention" | "Children & Minors" | "Third-Party Sharing" | "Personal Identifiers",
      "clauseExcerpt": "Exact quotation from the policy",
      "explanation": "Clear explanation of what it means in plain language",
      "riskImpact": "Practical privacy risk for the user"
    }
  ]
}

RISK RULES:
0-33 = Low
34-66 = Moderate
67-100 = High
The riskIndicator must be a number from 0 to 100.

This is an informational AI-generated assessment and is not legal advice.

POLICY TEXT TO ANALYZE:
${text.slice(0, 40000)}`;

    let response: any;
    try {
      response = await callGeminiWithFallback(ai, prompt, {
        responseMimeType: 'application/json',
        temperature: 0.1,
      });
    } catch (modelErr: any) {
      // Seamlessly fall back to heuristic analysis if all Gemini models are unavailable
      const fallbackAnalysis = analyzePolicyHeuristically(text, serviceName);
      return res.json({ analysis: fallbackAnalysis, source: 'heuristic-fallback' });
    }

    const responseText = response.text || '';
    if (!responseText.trim()) {
      throw new Error('Gemini returned an empty response. Please try again.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch (e) {
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Apply strict risk rules
    const rawScore = Number(parsed.riskIndicator ?? parsed.riskScore ?? 35);
    const riskScore = Math.min(100, Math.max(0, isNaN(rawScore) ? 35 : Math.round(rawScore)));
    const riskLevel: 'Low' | 'Moderate' | 'High' = 
      riskScore <= 33 ? 'Low' : riskScore <= 66 ? 'Moderate' : 'High';

    function normalizeFinding(name: string, val: any, excerptVal?: any) {
      let status: 'Detected' | 'Not Mentioned' | 'Unclear' = 'Detected';
      let items: string[] = [];
      let excerpt = typeof excerptVal === 'string' && excerptVal.trim() && !['not mentioned', 'none', 'unclear', 'n/a'].includes(excerptVal.trim().toLowerCase())
        ? excerptVal.trim()
        : undefined;

      if (val === undefined || val === null) {
        status = 'Not Mentioned';
      } else if (typeof val === 'string') {
        const lower = val.trim().toLowerCase();
        if (lower === 'not mentioned' || lower === 'none' || lower === '' || lower.includes('not mentioned')) {
          status = 'Not Mentioned';
        } else if (lower === 'unclear' || lower.includes('ambiguous')) {
          status = 'Unclear';
          items = [val.trim()];
        } else {
          status = 'Detected';
          items = [val.trim()];
        }
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          status = 'Not Mentioned';
        } else {
          const first = String(val[0]).trim().toLowerCase();
          if (first === 'not mentioned' || first === 'none' || first.includes('not mentioned')) {
            status = 'Not Mentioned';
          } else if (first === 'unclear' || first.includes('ambiguous')) {
            status = 'Unclear';
            items = val.map(String).map(s => s.trim()).filter(Boolean);
          } else {
            status = 'Detected';
            items = val.map(String).map(s => s.trim()).filter(Boolean);
          }
        }
      } else if (typeof val === 'object') {
        if (val.status && ['Detected', 'Not Mentioned', 'Unclear'].includes(val.status)) {
          status = val.status;
        }
        if (Array.isArray(val.items)) {
          items = val.items.map(String).map((s: string) => s.trim()).filter(Boolean);
        } else if (typeof val.description === 'string') {
          items = [val.description.trim()];
        }
        if (val.excerpt && !excerpt) {
          excerpt = String(val.excerpt).trim();
        }
      }

      return {
        title: name,
        status,
        items,
        excerpt
      };
    }

    const trackingFinding = normalizeFinding('Tracking', parsed.tracking, parsed.trackingExcerpt);
    const cookiesFinding = normalizeFinding('Cookies', parsed.cookies, parsed.cookiesExcerpt);
    const trackingCookiesStatus: 'Detected' | 'Not Mentioned' | 'Unclear' = 
      (trackingFinding.status === 'Detected' || cookiesFinding.status === 'Detected') ? 'Detected' :
      (trackingFinding.status === 'Unclear' || cookiesFinding.status === 'Unclear') ? 'Unclear' : 'Not Mentioned';

    const trackingCookiesItems = Array.from(new Set([...trackingFinding.items, ...cookiesFinding.items]));

    const findings = {
      dataCollected: normalizeFinding('Data Collected', parsed.dataCollected, parsed.dataCollectedExcerpt),
      sensitiveData: normalizeFinding('Sensitive Data', parsed.sensitiveData, parsed.sensitiveDataExcerpt),
      dataSharing: normalizeFinding('Data Sharing', parsed.dataSharing, parsed.dataSharingExcerpt),
      thirdParties: normalizeFinding('Third Parties', parsed.thirdParties, parsed.thirdPartiesExcerpt),
      tracking: trackingFinding,
      cookies: cookiesFinding,
      trackingCookies: {
        title: 'Tracking & Cookies',
        status: trackingCookiesStatus,
        items: trackingCookiesItems.length > 0 ? trackingCookiesItems : (trackingCookiesStatus === 'Not Mentioned' ? [] : ['Tracking/cookie disclosures are ambiguous']),
        excerpt: trackingFinding.excerpt || cookiesFinding.excerpt
      },
      dataRetention: normalizeFinding('Data Retention', parsed.retention, parsed.retentionExcerpt),
      userRights: normalizeFinding('User Rights', parsed.userRights, parsed.userRightsExcerpt),
      security: normalizeFinding('Security', parsed.security, parsed.securityExcerpt),
      privacyConcerns: normalizeFinding('Privacy Concerns', parsed.concerns, parsed.concernsExcerpt),
      importantClauses: normalizeFinding('Important Clauses', Array.isArray(parsed.importantClauses) ? parsed.importantClauses.map((c: any) => c.title || c) : [], parsed.importantClauses?.[0]?.clauseExcerpt)
    };

    const importantClauses = Array.isArray(parsed.importantClauses)
      ? parsed.importantClauses.map((c: any, idx: number) => ({
          id: `clause-${idx + 1}`,
          title: c.title || `Important Clause ${idx + 1}`,
          severity: c.severity === 'critical' ? 'critical' : c.severity === 'warning' ? 'warning' : 'info',
          category: c.category || 'General',
          clauseExcerpt: c.clauseExcerpt || c.excerpt || '',
          explanation: c.explanation || c.description || 'Analysis of this clause from the policy text.',
          riskImpact: c.riskImpact || c.impact || 'Practical impact on user privacy.'
        }))
      : [];

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const readingTimeMinutesSaved = Math.max(1, Math.round(wordCount / 200));

    let resolvedName = serviceName?.trim();
    if (!resolvedName || resolvedName.toLowerCase() === 'custom service' || resolvedName.toLowerCase() === 'custom') {
      const match = text.slice(0, 500).match(/([A-Za-z0-9\s]{2,25})\s+(Privacy Policy|Privacy Notice|Terms of Service)/i);
      resolvedName = match && match[1] ? match[1].trim() : 'Submitted Privacy Policy';
    }

    const analysisResult = {
      id: 'analysis-' + Date.now(),
      serviceName: resolvedName,
      companyName: parsed.companyName || undefined,
      serviceCategory: 'Other',
      analyzedAt: new Date().toISOString().split('T')[0],
      readingTimeMinutesSaved,
      wordCount,
      riskScore,
      riskLevel,
      oneSentenceVerdict: parsed.summary || `${resolvedName} scored an AI-generated Privacy Risk Indicator of ${riskScore}/100 (${riskLevel} Risk).`,
      disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
      plainLanguageSummary: parsed.summary,
      findings,
      executiveSummary: {
        dataCollected: findings.dataCollected.items.length > 0 ? findings.dataCollected.items : ['Not Mentioned in submitted policy text'],
        dataShared: findings.dataSharing.items.length > 0 ? findings.dataSharing.items : (findings.thirdParties.items.length > 0 ? findings.thirdParties.items : ['Not Mentioned in submitted policy text']),
        userControls: findings.userRights.items.length > 0 ? findings.userRights.items : ['No explicit user controls mentioned'],
        humanReadableSummary: parsed.summary || 'Summary generated from submitted privacy policy text.'
      },
      importantClauses,
      redFlags: importantClauses,
      categoryBreakdown: [
        {
          category: 'Personal Identifiers',
          score: findings.sensitiveData.status === 'Detected' ? 45 : 75,
          status: findings.sensitiveData.status === 'Detected' ? 'Moderate' : 'Good',
          icon: 'Fingerprint',
          highlights: findings.dataCollected.items.slice(0, 2),
          concerns: findings.sensitiveData.items.slice(0, 2)
        },
        {
          category: 'Telemetry & Tracking',
          score: findings.tracking.status === 'Detected' ? 40 : 80,
          status: findings.tracking.status === 'Detected' ? 'Moderate' : 'Good',
          icon: 'Smartphone',
          highlights: findings.tracking.status === 'Not Mentioned' ? ['No cross-site telemetry disclosed'] : [],
          concerns: findings.trackingCookies.items.slice(0, 2)
        },
        {
          category: 'Third-Party Sharing',
          score: findings.dataSharing.status === 'Detected' ? 35 : 85,
          status: findings.dataSharing.status === 'Detected' ? 'Poor' : 'Good',
          icon: 'Share2',
          highlights: findings.dataSharing.status === 'Not Mentioned' ? ['No third-party data sales disclosed'] : [],
          concerns: findings.thirdParties.items.slice(0, 2)
        },
        {
          category: 'Data Retention & Storage',
          score: findings.dataRetention.status === 'Detected' ? 65 : 45,
          status: findings.dataRetention.status === 'Detected' ? 'Good' : 'Moderate',
          icon: 'Database',
          highlights: findings.dataRetention.items.slice(0, 2),
          concerns: findings.dataRetention.status === 'Not Mentioned' ? ['Retention period not disclosed'] : []
        },
        {
          category: 'User Rights & Controls',
          score: findings.userRights.status === 'Detected' ? 80 : 35,
          status: findings.userRights.status === 'Detected' ? 'Good' : 'Poor',
          icon: 'ShieldCheck',
          highlights: findings.userRights.items.slice(0, 2),
          concerns: findings.userRights.status === 'Not Mentioned' ? ['No explicit user rights disclosed'] : []
        }
      ],
      dataRetention: {
        retainedAfterAccountDeletion: true,
        retentionPeriod: findings.dataRetention.items.join('; ') || 'Not specified in provided text.',
        summary: findings.dataRetention.excerpt || (findings.dataRetention.status === 'Not Mentioned' ? 'Retention duration is not mentioned in the submitted policy text.' : 'Review account settings for retention preferences.')
      },
      thirdPartySharing: {
        sellsDataToBrokers: findings.dataSharing.items.some(i => {
          const lower = i.toLowerCase();
          return (lower.includes('sell') || lower.includes('broker')) && 
            !lower.includes('do not sell') && 
            !lower.includes('no data sold') && 
            !lower.includes('never sell') && 
            !lower.includes('does not sell') &&
            !lower.includes('not sell');
        }),
        sharesWithAdvertisers: findings.thirdParties.items.some(i => i.toLowerCase().includes('ad') || i.toLowerCase().includes('marketing')),
        sharesWithAffiliates: findings.dataSharing.items.some(i => i.toLowerCase().includes('affiliate')),
        governmentDisclosurePolicy: 'Disclosed when compelled by subpoena or court order.',
        identifiedPartners: findings.thirdParties.items.length > 0 ? findings.thirdParties.items : ['None explicitly identified in text']
      },
      optOutGuidance: {
        hasDataDownloadTool: findings.userRights.items.some(i => i.toLowerCase().includes('download') || i.toLowerCase().includes('export') || i.toLowerCase().includes('portab')),
        hasAccountDeletionOption: findings.userRights.items.some(i => i.toLowerCase().includes('delete') || i.toLowerCase().includes('erasure')),
        steps: [
          {
            step: 1,
            action: 'Configure Privacy & Tracking Settings',
            description: findings.cookies.status === 'Detected'
              ? 'Review cookie banners and browser privacy settings to limit advertising and tracking cookies.'
              : 'Review account security and privacy controls to restrict unnecessary telemetry.'
          },
          {
            step: 2,
            action: 'Exercise Applicable Data Rights',
            description: findings.userRights.items.length > 0
              ? `Submit requests for ${findings.userRights.items.slice(0, 3).join(', ')} via official account settings or privacy contact.`
              : 'Contact the service data protection officer or privacy email to request data access or account deletion.'
          }
        ]
      },
      rawPolicyExcerpt: text.slice(0, 2000)
    };

    return res.json({ analysis: analysisResult, source: 'gemini' });
  } catch (err: any) {
    // Graceful fallback to heuristic analysis if processing fails
    try {
      const fallback = analyzePolicyHeuristically(req.body?.text || '', req.body?.serviceName);
      return res.json({ analysis: fallback, source: 'heuristic-fallback' });
    } catch {
      return res.status(500).json({
        error: 'Unable to process policy text. Please verify the content and try again.'
      });
    }
  }
});

// Interactive AI Privacy Assistant / Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, policyContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      const q = message.toLowerCase();
      let answer = '';

      if (q.includes('sell') || q.includes('broker')) {
        answer = `Based on this privacy policy analysis, the document specifies whether data is shared with third-party advertising partners or ad brokers. Check the **Important Clauses** and **Third-Party Sharing** sections for explicit quotes. (Please note: this is an informational assessment, not legal advice).`;
      } else if (q.includes('delete') || q.includes('erase') || q.includes('cancel')) {
        answer = `To delete your account data, check the **Opt-Out Guidance** section. Most services offer an account settings portal to initiate deletion, though transactional and backup records may be retained for operational purposes.`;
      } else if (q.includes('ai') || q.includes('train') || q.includes('model')) {
        answer = `Regarding AI training: Review the **Detailed Analysis** tab to see whether user queries, uploads, or chats are used to train or refine machine learning models.`;
      } else if (q.includes('location') || q.includes('gps') || q.includes('track')) {
        answer = `Location collection typically includes either approximate city-level location (from IP) or precise GPS coordinates. You can reduce tracking by changing your mobile device permission to "While Using" or "Never".`;
      } else {
        answer = `Based on the policy analysis: The document outlines specific rules for data collection, third-party disclosure, and available user settings. You can explore the **Privacy Overview**, **Important Clauses**, and **Opt-Out Guidance** tabs for more details.`;
      }

      return res.json({
        reply: answer,
        source: 'heuristic'
      });
    }

    const systemPrompt = `You are PrivacyLens AI Assistant, an informational AI analyzer that helps users understand privacy policies in clear, plain language.
You are NOT a lawyer or legal counsel, and you do NOT provide legal advice or legal conclusions.
Answer the user's specific question regarding the privacy policy they are currently reviewing.
Be direct, helpful, objective, and reference relevant disclosures from the provided policy summary.
Keep your answer clear, easy to understand, and practical.

POLICY CONTEXT & KEY FINDINGS:
${policyContext || 'General privacy policy principles'}`;

    const chatPrompt = `${systemPrompt}

USER QUESTION:
${message}`;

    try {
      const response = await callGeminiWithFallback(ai, chatPrompt, {
        temperature: 0.3,
      });

      return res.json({
        reply: response.text || 'I analyzed the policy, but could not generate a response. Please try rephrasing your question.',
        source: 'gemini'
      });
    } catch {
      return res.json({
        reply: 'I was unable to consult the AI model at this moment. You can review the Important Clauses and Category Breakdown tabs for verified insights.',
        source: 'error-fallback'
      });
    }
  } catch {
    return res.json({
      reply: 'An error occurred while answering your question. Please try asking again.',
      source: 'error-fallback'
    });
  }
});

// Vite middleware in dev or static serving in production
async function start() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        ws: { server },
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`PrivacyLens server running at http://0.0.0.0:${PORT}`);
  });
}

start();
