const fs = require('fs');

const replacements = [
  {
    file: 'backend/scripts/test_webhook_v2.js',
    replaces: [
      { from: '✅  SUCCESS', to: 'SUCCESS' },
      { from: '❌  FAILED', to: 'FAILED' }
    ]
  },
  {
    file: 'backend/src/routes/payments.js',
    replaces: [
      { from: '✅ Premium activated', to: 'Premium activated' },
      { from: '✓ Premium activated', to: 'Premium activated' }
    ]
  },
  {
    file: 'frontend/src/api/notificationService.js',
    replaces: [
      { from: 'icon: "💳"', to: 'icon: "ti ti-credit-card"' },
      { from: 'icon: "📋"', to: 'icon: "ti ti-clipboard"' },
      { from: 'icon: "🤖"', to: 'icon: "ti ti-robot"' },
      { from: 'icon: "⭐"', to: 'icon: "ti ti-star"' },
      { from: 'icon: "📄"', to: 'icon: "ti ti-file"' },
      { from: 'icon: "⚙️"', to: 'icon: "ti ti-settings"' }
    ]
  },
  {
    file: 'frontend/src/components/home/PopularDestinations.jsx',
    replaces: [
      { from: "emoji: '🇺🇸'", to: "emoji: ''" },
      { from: "emoji: '🇬🇧'", to: "emoji: ''" },
      { from: "emoji: '🇨🇦'", to: "emoji: ''" },
      { from: "emoji: '🇩🇪'", to: "emoji: ''" },
      { from: "emoji: '🇦🇺'", to: "emoji: ''" },
      { from: "emoji: '🇯🇵'", to: "emoji: ''" }
    ]
  },
  {
    file: 'frontend/src/components/NotificationCenter.jsx',
    replaces: [
      { from: '<p className="text-lg">✨ No notifications</p>', to: '<p className="text-lg">No notifications</p>' },
      { from: 'icon: "📬"', to: 'icon: "ti ti-mailbox"' },
      { from: 'icon: "💳"', to: 'icon: "ti ti-credit-card"' },
      { from: 'icon: "📋"', to: 'icon: "ti ti-clipboard"' },
      { from: 'icon: "🤖"', to: 'icon: "ti ti-robot"' },
      { from: 'icon: "⭐"', to: 'icon: "ti ti-star"' },
      { from: 'icon: "📄"', to: 'icon: "ti ti-file"' },
      { from: 'icon: "⚙️"', to: 'icon: "ti ti-settings"' },
      { from: '<p className="text-2xl mb-2">✨</p>', to: '<i className="ti ti-bell text-2xl mb-2 block"></i>' }
    ]
  },
  {
    file: 'frontend/src/hooks/useNotificationPoller.js',
    replaces: [
      { from: '🔔 Notification polling started', to: 'Notification polling started' },
      { from: '🔔 Notification polling stopped', to: 'Notification polling stopped' },
      { from: '🔔 Polling paused', to: 'Polling paused' },
      { from: '🔔 Polling resumed', to: 'Polling resumed' }
    ]
  },
  {
    file: 'frontend/src/pages/admin/AdminLogin.jsx',
    replaces: [
      { from: '<span className="text-4xl">🛡️</span>', to: '<i className="ti ti-shield text-4xl"></i>' }
    ]
  },
  {
    file: 'frontend/src/pages/admin/AdminVisaOutcome.jsx',
    replaces: [
      { from: '>✅ Approved<', to: '>Approved<' },
      { from: '>❌ Denied<', to: '>Denied<' }
    ]
  },
  {
    file: 'frontend/src/pages/admin/ConsultancyManagement.jsx',
    replaces: [
      { from: '⭐ {agency.rating}/5', to: '<i className="ti ti-star-filled text-amber-400"></i> {agency.rating}/5' }
    ]
  },
  {
    file: 'frontend/src/pages/admin/ManageDocuments.jsx',
    replaces: [
      { from: '>✅ Verify<', to: '>Verify<' },
      { from: '>❌ Reject<', to: '>Reject<' }
    ]
  },
  {
    file: 'frontend/src/pages/PaymentSuccess.jsx',
    replaces: [
      { from: '"🎉 Premium features activated!"', to: '"Premium features activated!"' }
    ]
  },
  {
    file: 'frontend/src/pages/VisaConsultancy.jsx',
    replaces: [
      { from: '📍 {agency.city}', to: '<i className="ti ti-map-pin"></i> {agency.city}' }
    ]
  }
];

replacements.forEach(({ file, replaces }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    replaces.forEach(({ from, to }) => {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    });
    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed:', file);
  } else {
    console.log('File not found:', file);
  }
});
