import { PolicyAnalysis } from '../types';

export const SAMPLE_POLICIES: PolicyAnalysis[] = [
  {
    id: 'sample-tiktok',
    serviceName: 'TikTok',
    companyName: 'ByteDance Ltd.',
    serviceCategory: 'Social Media',
    policyUrl: 'https://www.tiktok.com/legal/privacy-policy-us',
    analyzedAt: '2025-02-14',
    readingTimeMinutesSaved: 48,
    wordCount: 8450,
    riskScore: 82,
    riskLevel: 'High',
    oneSentenceVerdict: 'High risk indicator driven by extensive biometric processing (face/voiceprints), clipboard inspection, keystroke patterns, and broad cross-border affiliate sharing.',
    disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
    executiveSummary: {
      dataCollected: [
        'Biometric identifiers (faceprints, voiceprints) extracted from uploaded media',
        'Keystroke patterns, typing cadence, and device clipboard contents',
        'GPS location coordinates and network telemetry',
        'Direct message contents and metadata between users',
        'Cross-app tracking and web activity via tracking pixels'
      ],
      dataShared: [
        'Corporate affiliates within ByteDance global corporate group',
        'Third-party behavioral ad networks and measurement partners',
        'Cloud hosting and infrastructure providers',
        'Authorities upon formal regulatory or legal requests'
      ],
      userControls: [
        'Option to request user data archive',
        'Account deactivation with a 30-day grace period before purge',
        'Personalized advertising toggle (generic tracking persists)'
      ],
      humanReadableSummary: 'TikTok collects deep behavioral and biometric data across devices to power feed recommendation and ad targeting.'
    },
    importantClauses: [
      {
        id: 'rf-tt-1',
        title: 'Biometric Data Extraction',
        severity: 'critical',
        category: 'Biometrics',
        clauseExcerpt: 'We may collect biometric identifiers and biometric information as defined under US laws, such as faceprints and voiceprints, from your User Content.',
        explanation: 'Scans video and audio clips to extract facial geometry and voice recognition profiles.',
        riskImpact: 'Creates permanent biometric profiles linked to your account.'
      },
      {
        id: 'rf-tt-2',
        title: 'Clipboard and Sensor Telemetry',
        severity: 'critical',
        category: 'Telemetry & Tracking',
        clauseExcerpt: 'We collect information about the keystroke patterns or rhythms... and with your permission, we may access content, including text, images, and video, found in your device clipboard.',
        explanation: 'Monitors typing dynamics and can read copied text from the system clipboard.',
        riskImpact: 'Potential exposure of copied text, passwords, or links.'
      },
      {
        id: 'rf-tt-3',
        title: 'Affiliate Sharing Across Global Subsidiaries',
        severity: 'warning',
        category: 'Third-Party Sharing',
        clauseExcerpt: 'We share your information with members, subsidiaries, or affiliates of our corporate group to provide the Platform and improve services.',
        explanation: 'Data may be accessed by teams across global corporate subsidiaries.',
        riskImpact: 'Cross-border data transfers subject to multiple sovereign jurisdictions.'
      },
      {
        id: 'rf-tt-4',
        title: 'Delayed Deletion & Backup Retention',
        severity: 'warning',
        category: 'Data Retention',
        clauseExcerpt: 'When you request that your account be deleted, your account will first be deactivated for 30 days. We may retain information as required by law or for legitimate business purposes.',
        explanation: 'Content is deactivated for 30 days, while certain operational telemetry is retained longer.',
        riskImpact: 'Immediate deletion is not performed.'
      }
    ],
    redFlags: [
      {
        id: 'rf-tt-1',
        title: 'Biometric Data Extraction',
        severity: 'critical',
        category: 'Biometrics',
        clauseExcerpt: 'We may collect biometric identifiers and biometric information as defined under US laws, such as faceprints and voiceprints, from your User Content.',
        explanation: 'Scans video and audio clips to extract facial geometry and voice recognition profiles.',
        riskImpact: 'Creates permanent biometric profiles linked to your account.'
      },
      {
        id: 'rf-tt-2',
        title: 'Clipboard and Sensor Telemetry',
        severity: 'critical',
        category: 'Telemetry & Tracking',
        clauseExcerpt: 'We collect information about the keystroke patterns or rhythms... and with your permission, we may access content, including text, images, and video, found in your device clipboard.',
        explanation: 'Monitors typing dynamics and can read copied text from the system clipboard.',
        riskImpact: 'Potential exposure of copied text, passwords, or links.'
      }
    ],
    categoryBreakdown: [
      {
        category: 'Personal Identifiers & Bio',
        score: 85,
        status: 'Poor',
        icon: 'Fingerprint',
        highlights: ['Collects standard account profile'],
        concerns: ['Extracts faceprints and voiceprints', 'Keystroke timing profiling']
      },
      {
        category: 'Device & Telemetry',
        score: 80,
        status: 'Poor',
        icon: 'Smartphone',
        highlights: ['Diagnostic device health telemetry'],
        concerns: ['Clipboard inspection', 'Sensory accelerometer tracking']
      },
      {
        category: 'Location & Tracking',
        score: 72,
        status: 'Moderate',
        icon: 'MapPin',
        highlights: ['Approximate region mapping'],
        concerns: ['GPS tracking when permitted']
      },
      {
        category: 'Third-Party Ad Sharing',
        score: 88,
        status: 'Poor',
        icon: 'Share2',
        highlights: ['Ad customization options in settings'],
        concerns: ['Data shared across advertising partners and brokers']
      }
    ],
    dataRetention: {
      retainedAfterAccountDeletion: true,
      retentionPeriod: '30-day deactivation period + analytical records',
      summary: 'Data remains deactivated for 30 days prior to permanent removal from primary databases.'
    },
    thirdPartySharing: {
      sellsDataToBrokers: true,
      sharesWithAdvertisers: true,
      sharesWithAffiliates: true,
      governmentDisclosurePolicy: 'Discloses records upon formal legal or regulatory requests.',
      identifiedPartners: ['ByteDance Entities', 'Ad Exchanges', 'Measurement SDKs']
    },
    optOutGuidance: {
      hasDataDownloadTool: true,
      hasAccountDeletionOption: true,
      steps: [
        {
          step: 1,
          action: 'Disable Personalized Advertising',
          description: 'Navigate to Settings & Privacy > Privacy > Ads personalization > Toggle OFF "Personalized ads".',
          directUrl: 'https://www.tiktok.com/setting/privacy'
        },
        {
          step: 2,
          action: 'Restrict Device Permissions',
          description: 'In phone settings, revoke clipboard access and limit location to "Never" or "Approximate".'
        },
        {
          step: 3,
          action: 'Request Account Data Copy',
          description: 'Settings > Privacy > Download your data > Choose preferred format.'
        }
      ]
    }
  },
  {
    id: 'sample-openai',
    serviceName: 'OpenAI / ChatGPT',
    companyName: 'OpenAI, LLC',
    serviceCategory: 'AI & Machine Learning',
    policyUrl: 'https://openai.com/policies/privacy-policy',
    analyzedAt: '2025-02-10',
    readingTimeMinutesSaved: 36,
    wordCount: 6200,
    riskScore: 48,
    riskLevel: 'Moderate',
    oneSentenceVerdict: 'Moderate risk indicator: user prompts and uploads are used to train future AI models by default on consumer tiers, with an opt-out toggle available in settings.',
    disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
    executiveSummary: {
      dataCollected: [
        'User prompt inputs, uploaded documents, code snippets, and completions',
        'Account credentials and payment records via third-party processors',
        'Technical telemetry: IP address, browser headers, session timestamps',
        'Feedback ratings and correction submissions'
      ],
      dataShared: [
        'Cloud hosting providers (Microsoft Azure)',
        'Authorized safety and data labeling contractors',
        'Payment processors and fraud prevention vendors',
        'Legal authorities when compelled by valid process'
      ],
      userControls: [
        'Option to turn OFF model training in Account Data Controls',
        'Privacy Portal allows account deletion and data export',
        'Chat history can be disabled'
      ],
      humanReadableSummary: 'OpenAI transparently uses consumer conversational data for model improvement unless opted out. Enterprise tiers do not train on customer data by default.'
    },
    importantClauses: [
      {
        id: 'rf-oa-1',
        title: 'Prompts Used for AI Model Training',
        severity: 'warning',
        category: 'AI Training',
        clauseExcerpt: 'We may use Content you provide us to improve our Services, for example to train the models that power ChatGPT.',
        explanation: 'Unless opted out or on Business/Enterprise tiers, prompts and uploads can be ingested into training datasets.',
        riskImpact: 'Potential memorization of proprietary text or queries in model weights.'
      },
      {
        id: 'rf-oa-2',
        title: 'Human Review Sampling for Safety',
        severity: 'warning',
        category: 'AI Training',
        clauseExcerpt: 'A select team of authorized personnel and specialized third-party contractors may review samples of Conversations to ensure model safety and alignment.',
        explanation: 'De-identified chat samples may be reviewed by human trainers.',
        riskImpact: 'Risk of review if personal information was included in prompts.'
      },
      {
        id: 'rf-oa-3',
        title: '30-Day Retention for Abuse Monitoring',
        severity: 'info',
        category: 'Data Retention',
        clauseExcerpt: 'When chat history is turned off, we retain your conversations for 30 days to monitor for abuse and security violations before permanently deleting them.',
        explanation: 'Conversations are kept for 30 days for safety verification before deletion.',
        riskImpact: 'Short-term storage even when chat history is off.'
      }
    ],
    redFlags: [
      {
        id: 'rf-oa-1',
        title: 'Prompts Used for AI Model Training',
        severity: 'warning',
        category: 'AI Training',
        clauseExcerpt: 'We may use Content you provide us to improve our Services, for example to train the models that power ChatGPT.',
        explanation: 'Unless opted out or on Business/Enterprise tiers, prompts and uploads can be ingested into training datasets.',
        riskImpact: 'Potential memorization of proprietary text or queries in model weights.'
      }
    ],
    categoryBreakdown: [
      {
        category: 'Model Training & Prompts',
        score: 55,
        status: 'Moderate',
        icon: 'Cpu',
        highlights: ['Opt-out toggle available in settings', 'API content not trained by default'],
        concerns: ['Enabled by default for consumer accounts']
      },
      {
        category: 'Data Retention & Deletion',
        score: 30,
        status: 'Good',
        icon: 'Trash2',
        highlights: ['Self-service data export', 'Standard 30-day purge for safety queues'],
        concerns: ['Trained models cannot retroactively unlearn data']
      },
      {
        category: 'Third-Party Sharing & Brokers',
        score: 20,
        status: 'Good',
        icon: 'Lock',
        highlights: ['Does not sell personal data to brokers', 'No ad retargeting network integration'],
        concerns: ['Shared with cloud partners (Microsoft Azure)']
      }
    ],
    dataRetention: {
      retainedAfterAccountDeletion: false,
      retentionPeriod: '30 days for abuse monitoring logs',
      summary: 'Account deletion permanently purges personal account data within 30 days.'
    },
    thirdPartySharing: {
      sellsDataToBrokers: false,
      sharesWithAdvertisers: false,
      sharesWithAffiliates: true,
      governmentDisclosurePolicy: 'Responds to formal subpoenas and legal processes.',
      identifiedPartners: ['Microsoft Azure', 'Stripe', 'Cloudflare']
    },
    optOutGuidance: {
      hasDataDownloadTool: true,
      hasAccountDeletionOption: true,
      steps: [
        {
          step: 1,
          action: 'Opt Out of AI Model Training',
          description: 'Go to Settings > Data Controls > Turn OFF "Improve the model for everyone".',
          directUrl: 'https://chatgpt.com/#settings/DataControls'
        },
        {
          step: 2,
          action: 'Export Personal Data Archive',
          description: 'Go to Settings > Data Controls > Click "Export Data".'
        }
      ]
    }
  },
  {
    id: 'sample-signal',
    serviceName: 'Signal Messenger',
    companyName: 'Signal Foundation',
    serviceCategory: 'Social Media',
    policyUrl: 'https://signal.org/legal/#privacy-policy',
    analyzedAt: '2025-02-12',
    readingTimeMinutesSaved: 15,
    wordCount: 1100,
    riskScore: 8,
    riskLevel: 'Low',
    oneSentenceVerdict: 'Low risk indicator: gold standard zero-knowledge architecture with default end-to-end encryption and zero advertising or tracker tracking.',
    disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
    executiveSummary: {
      dataCollected: [
        'Phone number (used solely for account registration)',
        'Account creation timestamp and day of last server contact',
        'Public cryptographic keys to establish E2EE sessions'
      ],
      dataShared: [
        'No data shared with ad networks or data brokers',
        'SMS gateway receives phone number only for one-time verification code',
        'Servers cannot produce message contents or contact lists'
      ],
      userControls: [
        'Direct in-app account deletion',
        'Private Contact Discovery hashes contacts locally on device',
        'Disappearing messages timer available for all chats'
      ],
      humanReadableSummary: 'Signal is architected to minimize server data retention. Messages, contacts, and media cannot be decrypted by the service.'
    },
    importantClauses: [
      {
        id: 'rf-sig-1',
        title: 'Phone Number Registration Requirement',
        severity: 'info',
        category: 'Personal Identifiers',
        clauseExcerpt: 'You register a phone number when you create a Signal account. Phone numbers are used to provide our Services to you and other Signal users.',
        explanation: 'A phone number is required to sign up, though usernames can now conceal it from public contacts.',
        riskImpact: 'Phone number association if username privacy is not configured.'
      }
    ],
    redFlags: [
      {
        id: 'rf-sig-1',
        title: 'Phone Number Registration Requirement',
        severity: 'info',
        category: 'Personal Identifiers',
        clauseExcerpt: 'You register a phone number when you create a Signal account. Phone numbers are used to provide our Services to you and other Signal users.',
        explanation: 'A phone number is required to sign up, though usernames can now conceal it from public contacts.',
        riskImpact: 'Phone number association if username privacy is not configured.'
      }
    ],
    categoryBreakdown: [
      {
        category: 'End-to-End Encryption',
        score: 5,
        status: 'Good',
        icon: 'Lock',
        highlights: ['Open-source Signal Protocol', 'Zero-knowledge server design'],
        concerns: []
      },
      {
        category: 'Data Minimization',
        score: 8,
        status: 'Good',
        icon: 'CheckCircle',
        highlights: ['No message content stored', 'No IP or call log retention'],
        concerns: []
      },
      {
        category: 'Advertising & Commercial Sharing',
        score: 0,
        status: 'Good',
        icon: 'Share2',
        highlights: ['Zero trackers', 'Non-profit 501(c)(3) funding model'],
        concerns: []
      }
    ],
    dataRetention: {
      retainedAfterAccountDeletion: false,
      retentionPeriod: 'Immediate upon in-app account deletion',
      summary: 'Cryptographic keys and server tokens are destroyed upon account deletion.'
    },
    thirdPartySharing: {
      sellsDataToBrokers: false,
      sharesWithAdvertisers: false,
      sharesWithAffiliates: false,
      governmentDisclosurePolicy: 'Cannot produce messages or contacts because servers do not possess decryption keys.',
      identifiedPartners: ['Twilio (SMS verification only)']
    },
    optOutGuidance: {
      hasDataDownloadTool: false,
      hasAccountDeletionOption: true,
      steps: [
        {
          step: 1,
          action: 'Hide Phone Number with a Username',
          description: 'Settings > Privacy > Phone Number > Set "Who Can See My Number" to "Nobody".'
        },
        {
          step: 2,
          action: 'Enable Default Disappearing Messages',
          description: 'Settings > Privacy > Disappearing Messages > Select default timer.'
        }
      ]
    }
  },
  {
    id: 'sample-zoom',
    serviceName: 'Zoom Video',
    companyName: 'Zoom Video Communications, Inc.',
    serviceCategory: 'Productivity & Video',
    policyUrl: 'https://explore.zoom.us/en/privacy/',
    analyzedAt: '2025-01-20',
    readingTimeMinutesSaved: 32,
    wordCount: 5400,
    riskScore: 54,
    riskLevel: 'Moderate',
    oneSentenceVerdict: 'Moderate risk indicator: collects meeting telemetry, hardware configurations, and attendee logs; updated policies confirm no AI training on customer content without consent.',
    disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
    executiveSummary: {
      dataCollected: [
        'Meeting recordings, transcripts, and whiteboard notes when recorded',
        'Device hardware specifications, IP address, and network diagnostics',
        'Attendee participant logs (join/leave timestamps, audio/video toggle states)'
      ],
      dataShared: [
        'Meeting hosts and account administrators receive attendee reporting',
        'Cloud infrastructure vendors (AWS, Oracle Cloud)',
        'Analytics and customer support platforms'
      ],
      userControls: [
        'Audio prompt notification when cloud recording begins',
        'Account deletion request through Privacy Portal',
        'Policy states customer audio/video is not used for AI training without consent'
      ],
      humanReadableSummary: 'Zoom collects extensive technical telemetry and host-accessible attendee logs, but has restricted AI training on customer communications.'
    },
    importantClauses: [
      {
        id: 'rf-zm-1',
        title: 'Host Administrative Access to Attendee Logs',
        severity: 'warning',
        category: 'Telemetry & Tracking',
        clauseExcerpt: 'Account owners and administrators can access information about meetings hosted on their account, including attendee lists, chat logs, recording downloads, and participant activity metrics.',
        explanation: 'Meeting hosts and organizations can review attendee participation logs and chat transcripts.',
        riskImpact: 'Attendee visibility and organizational monitoring.'
      },
      {
        id: 'rf-zm-2',
        title: 'Telemetry Used for Service Improvement',
        severity: 'warning',
        category: 'AI Training',
        clauseExcerpt: 'Zoom uses service generated data (telemetry, diagnostic metrics, aggregate usage data) to train its machine learning and algorithmic models.',
        explanation: 'Device diagnostics and usage metadata are analyzed for algorithmic improvements.',
        riskImpact: 'Telemetry profiling based on meeting patterns.'
      }
    ],
    redFlags: [
      {
        id: 'rf-zm-1',
        title: 'Host Administrative Access to Attendee Logs',
        severity: 'warning',
        category: 'Telemetry & Tracking',
        clauseExcerpt: 'Account owners and administrators can access information about meetings hosted on their account, including attendee lists, chat logs, recording downloads, and participant activity metrics.',
        explanation: 'Meeting hosts and organizations can review attendee participation logs and chat transcripts.',
        riskImpact: 'Attendee visibility and organizational monitoring.'
      }
    ],
    categoryBreakdown: [
      {
        category: 'Meeting Content & Video',
        score: 35,
        status: 'Good',
        icon: 'Video',
        highlights: ['Notice before cloud recording starts', 'E2EE mode supported'],
        concerns: ['Recordings managed by meeting host']
      },
      {
        category: 'Telemetry & Diagnostics',
        score: 60,
        status: 'Moderate',
        icon: 'Activity',
        highlights: ['Diagnostic logs purged periodically'],
        concerns: ['Participant attendance dashboards available to host']
      }
    ],
    dataRetention: {
      retainedAfterAccountDeletion: true,
      retentionPeriod: 'Controlled by host account; logs up to 12 months',
      summary: 'Past recordings remain accessible to meeting hosts even if an individual participant deletes their account.'
    },
    thirdPartySharing: {
      sellsDataToBrokers: false,
      sharesWithAdvertisers: true,
      sharesWithAffiliates: true,
      governmentDisclosurePolicy: 'Discloses when legally required by authorized court orders.',
      identifiedPartners: ['AWS', 'Oracle Cloud', 'Google Cloud']
    },
    optOutGuidance: {
      hasDataDownloadTool: true,
      hasAccountDeletionOption: true,
      steps: [
        {
          step: 1,
          action: 'Enable End-to-End Encryption for Personal Meetings',
          description: 'In Zoom web portal > Settings > Security > Enable "End-to-end encryption".'
        },
        {
          step: 2,
          action: 'Opt Out of Marketing Cookies',
          description: 'Click "Your Privacy Choices" in the footer on zoom.us to reject tracking cookies.'
        }
      ]
    }
  },
  {
    id: 'sample-spotify',
    serviceName: 'Spotify',
    companyName: 'Spotify AB',
    serviceCategory: 'Entertainment & Music',
    policyUrl: 'https://www.spotify.com/legal/privacy-policy/',
    analyzedAt: '2025-01-15',
    readingTimeMinutesSaved: 28,
    wordCount: 4800,
    riskScore: 42,
    riskLevel: 'Moderate',
    oneSentenceVerdict: 'Moderate risk indicator: transparent consumer privacy controls, but listening habits and advertising profiles are shared with commercial marketing partners.',
    disclaimer: 'Informational AI-generated assessment • Not a legal conclusion or legal advice',
    executiveSummary: {
      dataCollected: [
        'Playback history, search queries, playlists created, and track skip habits',
        'Device telemetry, connected audio hardware, IP address',
        'Approximate location derived from network connection',
        'Voice search audio when using voice commands'
      ],
      dataShared: [
        'Advertisers and programmatic ad exchanges (Free tier listeners)',
        'Music labels and artist teams receive aggregate statistics',
        'Connected social network partners (optional)'
      ],
      userControls: [
        'In-player "Private Session" mode to hide listening from friends',
        'Automated account data export available in web dashboard',
        'Opt-out toggles for tailored advertising'
      ],
      humanReadableSummary: 'Spotify balances user controls with behavioral ad targeting. Premium subscribers avoid audio ad tracking.'
    },
    importantClauses: [
      {
        id: 'rf-sp-1',
        title: 'Behavioral & Mood Profiling for Ads',
        severity: 'info',
        category: 'Telemetry & Tracking',
        clauseExcerpt: 'We process information about your interactions with the Spotify Service... we may infer your interests and preferences based on your usage.',
        explanation: 'Listening trends and workout playlists are analyzed to infer mood for ad targeting.',
        riskImpact: 'Behavioral profiling for ad delivery.'
      },
      {
        id: 'rf-sp-2',
        title: 'Voice Command Audio Processing',
        severity: 'warning',
        category: 'Biometrics',
        clauseExcerpt: 'If you use voice features, we collect and process speech data and audio recordings to fulfill your search requests.',
        explanation: 'Voice queries are processed to understand speech input.',
        riskImpact: 'Audio snippet storage during voice search.'
      }
    ],
    redFlags: [
      {
        id: 'rf-sp-1',
        title: 'Behavioral & Mood Profiling for Ads',
        severity: 'info',
        category: 'Telemetry & Tracking',
        clauseExcerpt: 'We process information about your interactions with the Spotify Service... we may infer your interests and preferences based on your usage.',
        explanation: 'Listening trends and workout playlists are analyzed to infer mood for ad targeting.',
        riskImpact: 'Behavioral profiling for ad delivery.'
      }
    ],
    categoryBreakdown: [
      {
        category: 'Listening Habits & Profiles',
        score: 45,
        status: 'Moderate',
        icon: 'Headphones',
        highlights: ['Private Session mode easily activated'],
        concerns: ['Inferred mood targeting for ad campaigns']
      },
      {
        category: 'Advertising Disclosures',
        score: 40,
        status: 'Moderate',
        icon: 'Radio',
        highlights: ['Clear toggle to disable tailored advertising in account portal'],
        concerns: ['Free tier supported by ad exchanges']
      }
    ],
    dataRetention: {
      retainedAfterAccountDeletion: false,
      retentionPeriod: '30 days after account deletion',
      summary: 'Account closure removes personal listening histories and followers within 30 days.'
    },
    thirdPartySharing: {
      sellsDataToBrokers: false,
      sharesWithAdvertisers: true,
      sharesWithAffiliates: true,
      governmentDisclosurePolicy: 'Discloses when compelled by applicable court orders.',
      identifiedPartners: ['Google Cloud', 'Ad Exchanges', 'Measurement Partners']
    },
    optOutGuidance: {
      hasDataDownloadTool: true,
      hasAccountDeletionOption: true,
      steps: [
        {
          step: 1,
          action: 'Turn Off Tailored Ads',
          description: 'Visit spotify.com/account/privacy and toggle OFF "Tailored ads".'
        },
        {
          step: 2,
          action: 'Disable Social Sharing',
          description: 'In app settings > Social > Disable "Share my listening activity".'
        }
      ]
    }
  }
];
