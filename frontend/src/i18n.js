import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      subtitle: 'Your command center for email outreach success',
      totalEmails: 'Total Emails',
      sent: 'Sent',
      replies: 'Replies',
      successRate: 'Success Rate',
      monitor: 'Monitor your email campaigns and track responses',
      startCampaign: 'Start Campaign',
      selectIndustry: 'Select Industry',
      recentActivity: 'Recent Activity',
      positiveReply: 'Positive reply from john@example.com',
      negativeReply: 'Negative reply from sarah@example.com',
      neutralReply: 'New email sent to mike@example.com',
      // Navbar
      nav_dashboard: 'Dashboard',
      nav_campaigns: 'Campaigns',
      nav_analytics: 'Analytics',
      nav_settings: 'Settings',
      nav_profile: 'Your Profile',
      nav_signout: 'Sign out',
      nav_language: 'Language',
      nav_theme: 'Theme',
      nav_user: 'User',
      nav_email: 'Email',
      nav_dark: 'Dark',
      nav_light: 'Light',
      // Footer
      footer_company: 'Email Outreach Bot',
      footer_desc: 'Automate your email outreach campaigns with AI-powered personalization and intelligent response tracking.',
      footer_quicklinks: 'Quick Links',
      footer_resources: 'Resources',
      footer_contact: 'Contact Us',
      footer_dashboard: 'Dashboard',
      footer_campaigns: 'Campaigns',
      footer_analytics: 'Analytics',
      footer_settings: 'Settings',
      footer_documentation: 'Documentation',
      footer_api: 'API Reference',
      footer_support: 'Support',
      footer_blog: 'Blog',
      footer_email: 'support@emailoutreachbot.com',
      footer_phone: '+1 (555) 123-4567',
      footer_address: '123 Business Ave, Suite 100\nSan Francisco, CA 94107',
      footer_privacy: 'Privacy Policy',
      footer_terms: 'Terms of Service',
      footer_cookie: 'Cookie Policy',
      footer_copyright: 'All rights reserved.',
      // Campaigns page translations
      'Campaigns': 'Campaigns',
      'Manage and monitor your email campaigns': 'Manage and monitor your email campaigns',
      'Total Sent': 'Total Sent',
      'Total Replies': 'Total Replies',
      'Average Open Rate': 'Average Open Rate',
      'Active Campaigns': 'Active Campaigns',
      'Sent': 'Sent',
      'Replies': 'Replies',
      'Open Rate': 'Open Rate',
      'Last Sent': 'Last Sent',
      'Campaign Details': 'Campaign Details',
      'Campaign Status': 'Campaign Status',
      'active': 'Active',
      'completed': 'Completed',
      'paused': 'Paused',
      // Analytics page translations
      'Analytics': 'Analytics',
      'Track and analyze your email campaign performance': 'Track and analyze your email campaign performance',
      // Landing page translations
      'Automate Your Email Outreach': 'Automate Your Email Outreach',
      'Transform your business with AI-powered email automation. Find leads, send campaigns, and grow your network 24/7.': 'Transform your business with AI-powered email automation. Find leads, send campaigns, and grow your network 24/7.',
      'Start My Campaign': 'Start My Campaign',
      'See It In Action': 'See It In Action',
      'Watch how easy it is to automate your email outreach': 'Watch how easy it is to automate your email outreach',
      'Powerful Features': 'Powerful Features',
      'Everything you need to run successful email campaigns': 'Everything you need to run successful email campaigns',
      'Global Email Scraping': 'Global Email Scraping',
      'Automatically find and verify business emails from any industry worldwide': 'Automatically find and verify business emails from any industry worldwide',
      'One-Click Campaigns': 'One-Click Campaigns',
      'Launch targeted email campaigns with just one click, 24/7': 'Launch targeted email campaigns with just one click, 24/7',
      'Email Verification': 'Email Verification',
      'Advanced verification system ensures high deliverability rates': 'Advanced verification system ensures high deliverability rates',
      'Smart Analytics': 'Smart Analytics',
      'Track campaign performance with detailed analytics and insights': 'Track campaign performance with detailed analytics and insights',
      '24/7 Automation': '24/7 Automation',
      'Set up automated campaigns that run around the clock': 'Set up automated campaigns that run around the clock',
      'AI-Powered Personalization': 'AI-Powered Personalization',
      'Personalize emails automatically for better response rates': 'Personalize emails automatically for better response rates',
      'Email Deliverability': 'Email Deliverability',
      'Automated Operation': 'Automated Operation',
      'Faster Outreach': 'Faster Outreach',
      'Ready to Transform Your Email Outreach?': 'Ready to Transform Your Email Outreach?',
      'Get Started Now': 'Get Started Now',
      'Welcome Back!': 'Welcome Back!',
      'Start Your Journey': 'Start Your Journey',
      'Continue with Google': 'Continue with Google',
      'Continue with LinkedIn': 'Continue with LinkedIn',
      'Continue with Facebook': 'Continue with Facebook',
      'or': 'or',
      'Email address': 'Email address',
      'Password': 'Password',
      'Sign In': 'Sign In',
      'Create Account': 'Create Account',
      "Don't have an account?": "Don't have an account?",
      'Already have an account?': 'Already have an account?',
      'Sign up': 'Sign up',
      'Sign in': 'Sign in',
      // New translations for testimonials and video
      'What Our Clients Say': 'What Our Clients Say',
      'Join thousands of satisfied users who have transformed their email outreach': 'Join thousands of satisfied users who have transformed their email outreach',
      'Watch Demo': 'Watch Demo',
      'Your browser does not support the video tag.': 'Your browser does not support the video tag.',
      // Navigation
      'Home': 'Home',
      'Features': 'Features',
      'Testimonials': 'Testimonials',
      'Pricing': 'Pricing',
      'About': 'About',
      'Blogs': 'Blogs',
      // Pricing
      'Simple, Transparent Pricing': 'Simple, Transparent Pricing',
      'Choose the perfect plan for your business needs': 'Choose the perfect plan for your business needs',
      'Most Popular': 'Most Popular',
      'month': 'month',
      'Get Started': 'Get Started',
      'Starter': 'Starter',
      'Professional': 'Professional',
      'Enterprise': 'Enterprise',
      '500 emails per month': '500 emails per month',
      'Basic email templates': 'Basic email templates',
      'Email verification': 'Email verification',
      'Basic analytics': 'Basic analytics',
      '24/7 support': '24/7 support',
      '2,000 emails per month': '2,000 emails per month',
      'Advanced email templates': 'Advanced email templates',
      'AI-powered personalization': 'AI-powered personalization',
      'Advanced analytics': 'Advanced analytics',
      'Priority support': 'Priority support',
      'Custom domain': 'Custom domain',
      '10,000 emails per month': '10,000 emails per month',
      'Custom email templates': 'Custom email templates',
      'Dedicated support': 'Dedicated support',
      'API access': 'API access',
      'Custom integrations': 'Custom integrations',
      'Supercharge Your Outreach with AI-Powered Email Automation': 'Supercharge Your Outreach with AI-Powered Email Automation',
      'Effortlessly find leads, launch campaigns, and grow your business 24/7. Experience the next generation of automated, personalized, and high-converting email outreach!': 'Effortlessly find leads, launch campaigns, and grow your business 24/7. Experience the next generation of automated, personalized, and high-converting email outreach!',
      blog1_title: 'Marketing Strategy 2025',
      blog1_summary: 'Discover the top strategies to maximize your marketing success in 2025.',
      blog1_content: `<h2 class='text-2xl font-bold mb-4'>Marketing Strategy 2025</h2>
<p class='mb-2'>2025 will be a year of hyper-personalization, omnichannel engagement, and data-driven decision making. To succeed, marketers must:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Leverage AI to analyze customer data and predict trends</li>
  <li>Integrate social, email, and content marketing for seamless experiences</li>
  <li>Focus on authentic storytelling and brand values</li>
  <li>Adopt agile marketing strategies to quickly adapt to market changes</li>
</ul>
<p>Stay ahead by investing in technology, upskilling your team, and always putting the customer first.</p>`,
      blog2_title: 'Lead Generation Secrets',
      blog2_summary: 'Unlock the secrets to finding and converting high-quality leads.',
      blog2_content: `<h2 class='text-2xl font-bold mb-4'>Lead Generation Secrets</h2>
<p class='mb-2'>Unlocking high-quality leads requires a mix of smart tactics and the right tools:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Build targeted lead lists using LinkedIn and industry databases</li>
  <li>Use lead magnets like eBooks and webinars to attract prospects</li>
  <li>Score leads with AI to prioritize outreach</li>
  <li>Nurture leads with personalized email sequences</li>
</ul>
<p>Consistency and value are key—focus on solving real problems for your audience.</p>`,
      blog3_title: 'AI Power in Email',
      blog3_summary: 'Explore how AI is revolutionizing email marketing and automation.',
      blog3_content: `<h2 class='text-2xl font-bold mb-4'>AI Power in Email</h2>
<p class='mb-2'>Artificial Intelligence is transforming email marketing by:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Personalizing subject lines and content at scale</li>
  <li>Optimizing send times for each recipient</li>
  <li>Segmenting audiences based on behavior and preferences</li>
  <li>Automating A/B testing and performance analysis</li>
</ul>
<p>Embrace AI to boost open rates, engagement, and ROI in your campaigns.</p>`,
      blog4_title: 'Trust on Cold Emailing',
      blog4_summary: 'Learn how to build trust and credibility with cold emails.',
      blog4_content: `<h2 class='text-2xl font-bold mb-4'>Trust on Cold Emailing</h2>
<p class='mb-2'>Building trust in cold emails is essential for response and conversion:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Start with a personalized, relevant subject line</li>
  <li>Be transparent about who you are and why you're reaching out</li>
  <li>Provide social proof and references</li>
  <li>Respect the recipient's time—be concise and clear</li>
</ul>
<p>Follow up thoughtfully and always offer value. Trust is earned, not given.</p>`,
      blog1_tag: 'Marketing',
      blog2_tag: 'Lead Gen',
      blog3_tag: 'AI',
      blog4_tag: 'Trust',
      'Blogs & Insights': 'Blogs & Insights',
      'Discover quick tips and how-tos to elevate your skills to the next level.': 'Discover quick tips and how-tos to elevate your skills to the next level.',
      'Read More': 'Read More',
      'Contact Us': 'Contact Us',
      "We'd love to hear from you! Reach out with your questions, feedback, or partnership ideas.": "We'd love to hear from you! Reach out with your questions, feedback, or partnership ideas.",
      'Name': 'Name',
      'Your Name': 'Your Name',
      'Email': 'Email',
      'you@email.com': 'you@email.com',
      'Message': 'Message',
      'How can we help you?': 'How can we help you?',
      'Thank you!': 'Thank you!',
      'Send Message': 'Send Message',
      'Contact Info': 'Contact Info',
      'Phone': 'Phone',
      'Address': 'Address',
      'Business Hours': 'Business Hours',
      'Mon - Fri: 9:00 AM - 6:00 PM': 'Mon - Fri: 9:00 AM - 6:00 PM',
      'Sat - Sun: Closed': 'Sat - Sun: Closed',
      'Welcome back': 'Welcome back',
      'Ready to start your next campaign?': 'Ready to start your next campaign?',
      'Continue with Google': 'Continue with Google',
      'Continue with Facebook': 'Continue with Facebook',
      'Continue with LinkedIn': 'Continue with LinkedIn',
      'Email address': 'Email address',
      'Password': 'Password',
      'Sign In': 'Sign In',
      'Create Account': 'Create Account',
      "Don't have an account?": "Don't have an account?",
      'Already have an account?': 'Already have an account?',
      'Sign up': 'Sign up',
      'Sign in': 'Sign in',
      'or': 'or',
    },
  },
  es: {
    translation: {
      dashboard: 'Tablero',
      subtitle: 'Tu centro de mando para el éxito en el alcance por correo',
      totalEmails: 'Emails Totales',
      sent: 'Enviados',
      replies: 'Respuestas',
      successRate: 'Tasa de Éxito',
      monitor: 'Supervisa tus campañas de correo y rastrea respuestas',
      startCampaign: 'Iniciar Campaña',
      selectIndustry: 'Seleccionar Industria',
      recentActivity: 'Actividad Reciente',
      positiveReply: 'Respuesta positiva de john@example.com',
      negativeReply: 'Respuesta negativa de sarah@example.com',
      neutralReply: 'Nuevo correo enviado a mike@example.com',
      // Navbar
      nav_dashboard: 'Tablero',
      nav_campaigns: 'Campañas',
      nav_analytics: 'Analítica',
      nav_settings: 'Configuración',
      nav_profile: 'Tu Perfil',
      nav_signout: 'Cerrar sesión',
      nav_language: 'Idioma',
      nav_theme: 'Tema',
      nav_user: 'Usuario',
      nav_email: 'Correo',
      nav_dark: 'Oscuro',
      nav_light: 'Claro',
      // Footer
      footer_company: 'Email Outreach Bot',
      footer_desc: 'Automatiza tus campañas de correo con personalización impulsada por IA y seguimiento inteligente de respuestas.',
      footer_quicklinks: 'Enlaces Rápidos',
      footer_resources: 'Recursos',
      footer_contact: 'Contáctanos',
      footer_dashboard: 'Tablero',
      footer_campaigns: 'Campañas',
      footer_analytics: 'Analítica',
      footer_settings: 'Configuración',
      footer_documentation: 'Documentación',
      footer_api: 'Referencia API',
      footer_support: 'Soporte',
      footer_blog: 'Blog',
      footer_email: 'soporte@emailoutreachbot.com',
      footer_phone: '+1 (555) 123-4567',
      footer_address: '123 Avenida Negocios, Oficina 100\nSan Francisco, CA 94107',
      footer_privacy: 'Política de Privacidad',
      footer_terms: 'Términos de Servicio',
      footer_cookie: 'Política de Cookies',
      footer_copyright: 'Todos los derechos reservados.',
      // Campaigns page translations
      'Campaigns': 'Campañas',
      'Manage and monitor your email campaigns': 'Gestiona y monitorea tus campañas de correo',
      'Total Sent': 'Total Enviados',
      'Total Replies': 'Total Respuestas',
      'Average Open Rate': 'Tasa de Apertura Promedio',
      'Active Campaigns': 'Campañas Activas',
      'Sent': 'Enviados',
      'Replies': 'Respuestas',
      'Open Rate': 'Tasa de Apertura',
      'Last Sent': 'Último Envío',
      'Campaign Details': 'Detalles de la Campaña',
      'Campaign Status': 'Estado de la Campaña',
      'active': 'Activa',
      'completed': 'Completada',
      'paused': 'Pausada',
      // Analytics page translations
      'Analytics': 'Análisis',
      'Track and analyze your email campaign performance': 'Seguimiento y análisis del rendimiento de tus campañas',
      // Landing page translations
      'Automate Your Email Outreach': 'Automatiza Tu Alcance por Email',
      'Transform your business with AI-powered email automation. Find leads, send campaigns, and grow your network 24/7.': 'Transforma tu negocio con automatización de email impulsada por IA. Encuentra leads, envía campañas y crece tu red 24/7.',
      'Start My Campaign': 'Iniciar Mi Campaña',
      'See It In Action': 'Verlo en Acción',
      'Watch how easy it is to automate your email outreach': 'Mira lo fácil que es automatizar tu alcance por email',
      'Powerful Features': 'Características Potentes',
      'Everything you need to run successful email campaigns': 'Todo lo que necesitas para ejecutar campañas de email exitosas',
      'Global Email Scraping': 'Extracción Global de Emails',
      'Automatically find and verify business emails from any industry worldwide': 'Encuentra y verifica automáticamente emails de negocios de cualquier industria en todo el mundo',
      'One-Click Campaigns': 'Campañas de Un Clic',
      'Launch targeted email campaigns with just one click, 24/7': 'Lanza campañas de email dirigidas con solo un clic, 24/7',
      'Email Verification': 'Verificación de Email',
      'Advanced verification system ensures high deliverability rates': 'Sistema avanzado de verificación asegura altas tasas de entrega',
      'Smart Analytics': 'Análisis Inteligente',
      'Track campaign performance with detailed analytics and insights': 'Sigue el rendimiento de las campañas con análisis detallados e insights',
      '24/7 Automation': 'Automatización 24/7',
      'Set up automated campaigns that run around the clock': 'Configura campañas automatizadas que funcionan las 24 horas',
      'AI-Powered Personalization': 'Personalización con IA',
      'Personalize emails automatically for better response rates': 'Personaliza emails automáticamente para mejores tasas de respuesta',
      'Email Deliverability': 'Entrega de Emails',
      'Automated Operation': 'Operación Automatizada',
      'Faster Outreach': 'Alcance Más Rápido',
      'Ready to Transform Your Email Outreach?': '¿Listo para Transformar tu Alcance por Email?',
      'Get Started Now': 'Comienza Ahora',
      'Welcome Back!': '¡Bienvenido de Nuevo!',
      'Start Your Journey': 'Comienza tu Viaje',
      'Continue with Google': 'Continuar con Google',
      'Continue with LinkedIn': 'Continuar con LinkedIn',
      'Continue with Facebook': 'Continuar con Facebook',
      'or': 'o',
      'Email address': 'Dirección de email',
      'Password': 'Contraseña',
      'Sign In': 'Iniciar Sesión',
      'Create Account': 'Crear Cuenta',
      "Don't have an account?": "¿No tienes una cuenta?",
      'Already have an account?': '¿Ya tienes una cuenta?',
      'Sign up': 'Registrarse',
      'Sign in': 'Iniciar sesión',
      // New translations for testimonials and video
      'What Our Clients Say': 'Lo Que Dicen Nuestros Clientes',
      'Join thousands of satisfied users who have transformed their email outreach': 'Únete a miles de usuarios satisfechos que han transformado su alcance por email',
      'Watch Demo': 'Ver Demo',
      'Your browser does not support the video tag.': 'Tu navegador no soporta el elemento de video.',
      // Navigation
      'Home': 'Inicio',
      'Features': 'Características',
      'Testimonials': 'Testimonios',
      'Pricing': 'Precios',
      'About': 'Acerca de',
      'Blogs': 'Blogs',
      // Pricing
      'Simple, Transparent Pricing': 'Precios Simples y Transparentes',
      'Choose the perfect plan for your business needs': 'Elige el plan perfecto para las necesidades de tu negocio',
      'Most Popular': 'Más Popular',
      'month': 'mes',
      'Get Started': 'Comenzar',
      'Starter': 'Inicial',
      'Professional': 'Profesional',
      'Enterprise': 'Empresarial',
      '500 emails per month': '500 emails por mes',
      'Basic email templates': 'Plantillas de email básicas',
      'Email verification': 'Verificación de email',
      'Basic analytics': 'Análisis básico',
      '24/7 support': 'Soporte 24/7',
      '2,000 emails per month': '2,000 emails por mes',
      'Advanced email templates': 'Plantillas de email avanzadas',
      'AI-powered personalization': 'Personalización con IA',
      'Advanced analytics': 'Análisis avanzado',
      'Priority support': 'Soporte prioritario',
      'Custom domain': 'Dominio personalizado',
      '10,000 emails per month': '10,000 emails por mes',
      'Custom email templates': 'Plantillas de email personalizadas',
      'Dedicated support': 'Soporte dedicado',
      'API access': 'Acceso a API',
      'Custom integrations': 'Integraciones personalizadas',
      'Supercharge Your Outreach with AI-Powered Email Automation': 'Potencia tu alcance con la automatización de correos impulsada por IA',
      'Effortlessly find leads, launch campaigns, and grow your business 24/7. Experience the next generation of automated, personalized, and high-converting email outreach!': 'Encuentra clientes potenciales, lanza campañas y haz crecer tu negocio 24/7. ¡Experimenta la próxima generación de correos automatizados, personalizados y de alta conversión!',
      blog1_title: 'Marketing Strategy 2025',
      blog1_summary: 'Discover the top strategies to maximize your marketing success in 2025.',
      blog1_content: `<h2 class='text-2xl font-bold mb-4'>Marketing Strategy 2025</h2>
<p class='mb-2'>2025 will be a year of hyper-personalization, omnichannel engagement, and data-driven decision making. To succeed, marketers must:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Leverage AI to analyze customer data and predict trends</li>
  <li>Integrate social, email, and content marketing for seamless experiences</li>
  <li>Focus on authentic storytelling and brand values</li>
  <li>Adopt agile marketing strategies to quickly adapt to market changes</li>
</ul>
<p>Stay ahead by investing in technology, upskilling your team, and always putting the customer first.</p>`,
      blog2_title: 'Lead Generation Secrets',
      blog2_summary: 'Unlock the secrets to finding and converting high-quality leads.',
      blog2_content: `<h2 class='text-2xl font-bold mb-4'>Lead Generation Secrets</h2>
<p class='mb-2'>Unlocking high-quality leads requires a mix of smart tactics and the right tools:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Build targeted lead lists using LinkedIn and industry databases</li>
  <li>Use lead magnets like eBooks and webinars to attract prospects</li>
  <li>Score leads with AI to prioritize outreach</li>
  <li>Nurture leads with personalized email sequences</li>
</ul>
<p>Consistency and value are key—focus on solving real problems for your audience.</p>`,
      blog3_title: 'AI Power in Email',
      blog3_summary: 'Explore how AI is revolutionizing email marketing and automation.',
      blog3_content: `<h2 class='text-2xl font-bold mb-4'>AI Power in Email</h2>
<p class='mb-2'>Artificial Intelligence is transforming email marketing by:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Personalizing subject lines and content at scale</li>
  <li>Optimizing send times for each recipient</li>
  <li>Segmenting audiences based on behavior and preferences</li>
  <li>Automating A/B testing and performance analysis</li>
</ul>
<p>Embrace AI to boost open rates, engagement, and ROI in your campaigns.</p>`,
      blog4_title: 'Trust on Cold Emailing',
      blog4_summary: 'Learn how to build trust and credibility with cold emails.',
      blog4_content: `<h2 class='text-2xl font-bold mb-4'>Trust on Cold Emailing</h2>
<p class='mb-2'>Building trust in cold emails is essential for response and conversion:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Start with a personalized, relevant subject line</li>
  <li>Be transparent about who you are and why you're reaching out</li>
  <li>Provide social proof and references</li>
  <li>Respect the recipient's time—be concise and clear</li>
</ul>
<p>Follow up thoughtfully and always offer value. Trust is earned, not given.</p>`,
      blog1_tag: 'Marketing',
      blog2_tag: 'Generación de Leads',
      blog3_tag: 'IA',
      blog4_tag: 'Confianza',
      'Blogs & Insights': 'Blogs y Consejos',
      'Discover quick tips and how-tos to elevate your skills to the next level.': 'Descubre consejos rápidos y tutoriales para llevar tus habilidades al siguiente nivel.',
      'Read More': 'Leer más',
      'Contact Us': 'Contáctanos',
      "We'd love to hear from you! Reach out with your questions, feedback, or partnership ideas.": '¡Nos encantaría saber de ti! Contáctanos con tus preguntas, comentarios o ideas de colaboración.',
      'Name': 'Nombre',
      'Your Name': 'Tu Nombre',
      'Email': 'Correo',
      'you@email.com': 'tu@email.com',
      'Message': 'Mensaje',
      'How can we help you?': '¿Cómo podemos ayudarte?',
      'Thank you!': '¡Gracias!',
      'Send Message': 'Enviar Mensaje',
      'Contact Info': 'Información de Contacto',
      'Phone': 'Teléfono',
      'Address': 'Dirección',
      'Business Hours': 'Horario de Atención',
      'Mon - Fri: 9:00 AM - 6:00 PM': 'Lun - Vie: 9:00 AM - 6:00 PM',
      'Sat - Sun: Closed': 'Sáb - Dom: Cerrado',
    },
  },
  zh: {
    translation: {
      dashboard: '仪表板',
      subtitle: '您的电子邮件推广成功指挥中心',
      totalEmails: '总邮件数',
      sent: '已发送',
      replies: '回复',
      successRate: '成功率',
      monitor: '监控您的电子邮件活动并跟踪回复',
      startCampaign: '开始活动',
      selectIndustry: '选择行业',
      recentActivity: '最近活动',
      positiveReply: '来自 john@example.com 的积极回复',
      negativeReply: '来自 sarah@example.com 的消极回复',
      neutralReply: '已向 mike@example.com 发送新邮件',
      // Navbar
      nav_dashboard: '仪表板',
      nav_campaigns: '活动',
      nav_analytics: '分析',
      nav_settings: '设置',
      nav_profile: '个人资料',
      nav_signout: '退出登录',
      nav_language: '语言',
      nav_theme: '主题',
      nav_user: '用户',
      nav_email: '邮箱',
      nav_dark: '深色',
      nav_light: '浅色',
      // Footer
      footer_company: '邮件推广机器人',
      footer_desc: '使用AI个性化和智能响应跟踪自动化您的邮件推广活动。',
      footer_quicklinks: '快速链接',
      footer_resources: '资源',
      footer_contact: '联系我们',
      footer_dashboard: '仪表板',
      footer_campaigns: '活动',
      footer_analytics: '分析',
      footer_settings: '设置',
      footer_documentation: '文档',
      footer_api: 'API参考',
      footer_support: '支持',
      footer_blog: '博客',
      footer_email: 'support@emailoutreachbot.com',
      footer_phone: '+1 (555) 123-4567',
      footer_address: '商务大道123号100室\n旧金山, CA 94107',
      footer_privacy: '隐私政策',
      footer_terms: '服务条款',
      footer_cookie: 'Cookie政策',
      footer_copyright: '版权所有。',
      // Campaigns page translations
      'Campaigns': '活动管理',
      'Manage and monitor your email campaigns': '管理和监控您的邮件活动',
      'Total Sent': '总发送量',
      'Total Replies': '总回复量',
      'Average Open Rate': '平均打开率',
      'Active Campaigns': '活跃活动',
      'Sent': '已发送',
      'Replies': '回复',
      'Open Rate': '打开率',
      'Last Sent': '最后发送',
      'Campaign Details': '活动详情',
      'Campaign Status': '活动状态',
      'active': '活跃',
      'completed': '已完成',
      'paused': '已暂停',
      // Analytics page translations
      'Analytics': '数据分析',
      'Track and analyze your email campaign performance': '跟踪和分析您的邮件活动表现',
      // Landing page translations
      'Automate Your Email Outreach': '自动化邮件推广',
      'Transform your business with AI-powered email automation. Find leads, send campaigns, and grow your network 24/7.': '使用AI驱动的邮件自动化改变您的业务。24/7全天候寻找潜在客户、发送活动并扩展您的网络。',
      'Start My Campaign': '开始我的活动',
      'See It In Action': '观看演示',
      'Watch how easy it is to automate your email outreach': '了解如何轻松实现邮件推广自动化',
      'Powerful Features': '强大功能',
      'Everything you need to run successful email campaigns': '运行成功邮件活动所需的一切',
      'Global Email Scraping': '全球邮件采集',
      'Automatically find and verify business emails from any industry worldwide': '自动查找和验证全球任何行业的商业邮件',
      'One-Click Campaigns': '一键式活动',
      'Launch targeted email campaigns with just one click, 24/7': '只需一键即可启动定向邮件活动，24/7全天候运行',
      'Email Verification': '邮件验证',
      'Advanced verification system ensures high deliverability rates': '先进的验证系统确保高送达率',
      'Smart Analytics': '智能分析',
      'Track campaign performance with detailed analytics and insights': '通过详细分析和洞察跟踪活动表现',
      '24/7 Automation': '24/7自动化',
      'Set up automated campaigns that run around the clock': '设置全天候运行的自动化活动',
      'AI-Powered Personalization': 'AI驱动的个性化',
      'Personalize emails automatically for better response rates': '自动个性化邮件以提高回复率',
      'Email Deliverability': '邮件送达率',
      'Automated Operation': '自动化运营',
      'Faster Outreach': '更快的推广',
      'Ready to Transform Your Email Outreach?': '准备好改变您的邮件推广了吗？',
      'Get Started Now': '立即开始',
      'Welcome Back!': '欢迎回来！',
      'Start Your Journey': '开始您的旅程',
      'Continue with Google': '使用Google继续',
      'Continue with LinkedIn': '使用LinkedIn继续',
      'Continue with Facebook': '使用Facebook继续',
      'or': '或',
      'Email address': '电子邮箱地址',
      'Password': '密码',
      'Sign In': '登录',
      'Create Account': '创建账户',
      "Don't have an account?": "还没有账户？",
      'Already have an account?': '已有账户？',
      'Sign up': '注册',
      'Sign in': '登录',
      // New translations for testimonials and video
      'What Our Clients Say': '客户评价',
      'Join thousands of satisfied users who have transformed their email outreach': '加入数千名已经改变邮件推广方式的满意用户',
      'Watch Demo': '观看演示',
      'Your browser does not support the video tag.': '您的浏览器不支持视频标签。',
      // Navigation
      'Home': '首页',
      'Features': '功能',
      'Testimonials': '客户评价',
      'Pricing': '价格',
      'About': '关于我们',
      'Blogs': '博客',
      // Pricing
      'Simple, Transparent Pricing': '简单透明的价格',
      'Choose the perfect plan for your business needs': '为您的业务需求选择完美方案',
      'Most Popular': '最受欢迎',
      'month': '月',
      'Get Started': '开始使用',
      'Starter': '入门版',
      'Professional': '专业版',
      'Enterprise': '企业版',
      '500 emails per month': '每月500封邮件',
      'Basic email templates': '基础邮件模板',
      'Email verification': '邮件验证',
      'Basic analytics': '基础分析',
      '24/7 support': '24/7支持',
      '2,000 emails per month': '每月2,000封邮件',
      'Advanced email templates': '高级邮件模板',
      'AI-powered personalization': 'AI驱动的个性化',
      'Advanced analytics': '高级分析',
      'Priority support': '优先支持',
      'Custom domain': '自定义域名',
      '10,000 emails per month': '每月10,000封邮件',
      'Custom email templates': '自定义邮件模板',
      'Dedicated support': '专属支持',
      'API access': 'API访问',
      'Custom integrations': '自定义集成',
      'Supercharge Your Outreach with AI-Powered Email Automation': '用AI驱动的邮件自动化提升您的外联',
      'Effortlessly find leads, launch campaigns, and grow your business 24/7. Experience the next generation of automated, personalized, and high-converting email outreach!': '轻松寻找潜在客户，启动活动，让您的业务全天候增长。体验新一代自动化、个性化、高转化率的邮件外联！',
      blog1_title: 'Marketing Strategy 2025',
      blog1_summary: 'Discover the top strategies to maximize your marketing success in 2025.',
      blog1_content: `<h2 class='text-2xl font-bold mb-4'>Marketing Strategy 2025</h2>
<p class='mb-2'>2025 will be a year of hyper-personalization, omnichannel engagement, and data-driven decision making. To succeed, marketers must:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Leverage AI to analyze customer data and predict trends</li>
  <li>Integrate social, email, and content marketing for seamless experiences</li>
  <li>Focus on authentic storytelling and brand values</li>
  <li>Adopt agile marketing strategies to quickly adapt to market changes</li>
</ul>
<p>Stay ahead by investing in technology, upskilling your team, and always putting the customer first.</p>`,
      blog2_title: 'Lead Generation Secrets',
      blog2_summary: 'Unlock the secrets to finding and converting high-quality leads.',
      blog2_content: `<h2 class='text-2xl font-bold mb-4'>Lead Generation Secrets</h2>
<p class='mb-2'>Unlocking high-quality leads requires a mix of smart tactics and the right tools:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Build targeted lead lists using LinkedIn and industry databases</li>
  <li>Use lead magnets like eBooks and webinars to attract prospects</li>
  <li>Score leads with AI to prioritize outreach</li>
  <li>Nurture leads with personalized email sequences</li>
</ul>
<p>Consistency and value are key—focus on solving real problems for your audience.</p>`,
      blog3_title: 'AI Power in Email',
      blog3_summary: 'Explore how AI is revolutionizing email marketing and automation.',
      blog3_content: `<h2 class='text-2xl font-bold mb-4'>AI Power in Email</h2>
<p class='mb-2'>Artificial Intelligence is transforming email marketing by:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Personalizing subject lines and content at scale</li>
  <li>Optimizing send times for each recipient</li>
  <li>Segmenting audiences based on behavior and preferences</li>
  <li>Automating A/B testing and performance analysis</li>
</ul>
<p>Embrace AI to boost open rates, engagement, and ROI in your campaigns.</p>`,
      blog4_title: 'Trust on Cold Emailing',
      blog4_summary: 'Learn how to build trust and credibility with cold emails.',
      blog4_content: `<h2 class='text-2xl font-bold mb-4'>Trust on Cold Emailing</h2>
<p class='mb-2'>Building trust in cold emails is essential for response and conversion:</p>
<ul class='list-disc ml-6 mb-2'>
  <li>Start with a personalized, relevant subject line</li>
  <li>Be transparent about who you are and why you're reaching out</li>
  <li>Provide social proof and references</li>
  <li>Respect the recipient's time—be concise and clear</li>
</ul>
<p>Follow up thoughtfully and always offer value. Trust is earned, not given.</p>`,
      blog1_tag: '市场营销',
      blog2_tag: '获客',
      blog3_tag: '人工智能',
      blog4_tag: '信任',
      'Blogs & Insights': '博客与见解',
      'Discover quick tips and how-tos to elevate your skills to the next level.': '发现快速技巧和操作指南，提升您的技能。',
      'Read More': '阅读更多',
      'Contact Us': '联系我们',
      "We'd love to hear from you! Reach out with your questions, feedback, or partnership ideas.": '欢迎联系我们！如有疑问、反馈或合作意向，敬请告知。',
      'Name': '姓名',
      'Your Name': '您的姓名',
      'Email': '邮箱',
      'you@email.com': '您的邮箱',
      'Message': '留言',
      'How can we help you?': '我们能为您做些什么？',
      'Thank you!': '谢谢！',
      'Send Message': '发送信息',
      'Contact Info': '联系信息',
      'Phone': '电话',
      'Address': '地址',
      'Business Hours': '营业时间',
      'Mon - Fri: 9:00 AM - 6:00 PM': '周一至周五：9:00-18:00',
      'Sat - Sun: Closed': '周六至周日：休息',
      'Welcome back': 'Welcome back',
      'Ready to start your next campaign?': 'Ready to start your next campaign?',
      'Continue with Google': 'Continue with Google',
      'Continue with Facebook': 'Continue with Facebook',
      'Continue with LinkedIn': 'Continue with LinkedIn',
      'Email address': 'Email address',
      'Password': 'Password',
      'Sign In': 'Sign In',
      'Create Account': 'Create Account',
      "Don't have an account?": "Don't have an account?",
      'Already have an account?': 'Already have an account?',
      'Sign up': 'Sign up',
      'Sign in': 'Sign in',
      'or': 'or',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 