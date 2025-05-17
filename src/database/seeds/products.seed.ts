import { ProductType } from '@app/modules/products/entities/product.entity';

export const productsSeed = [
  {
    name: 'Accessibility Widget',
    type: ProductType.ACCESSIBILITY_WIDGET,
    shortDescription: 'Level up your accessibility with our AI-Powered Widget',
    description: 'Our comprehensive accessibility widget provides users with various accessibility options including contrast adjustments, text size changes, reading guides, and more. Powered by AI to automatically enhance your website\'s accessibility.',
    features: [
      'Easy installation with a single line of code',
      'Customizable appearance and position',
      'WCAG 2.1 AA compliance',
      'Multiple accessibility enhancements',
      'User preference memory',
      'Analytics dashboard'
    ],
    isPopular: true,
    order: 0,
    iconUrl: '/icons/widget.svg'
  },
  {
    name: 'Accessibility Monitor',
    type: ProductType.ACCESSIBILITY_MONITOR,
    shortDescription: 'Scan & export detailed accessibility issues, with code-level alerts',
    description: 'Our Accessibility Monitor continuously scans your website for accessibility issues and provides detailed reports with code-level alerts. Stay on top of compliance issues before they become problems.',
    features: [
      'Continuous automated scanning',
      'Detailed issue reports',
      'Code-level remediation suggestions',
      'Export functionality',
      'Integration with development workflows',
      'Scheduled scanning and alerts'
    ],
    isPopular: false,
    order: 1,
    iconUrl: '/icons/monitor.svg'
  },
  {
    name: 'Accessibility Audits',
    type: ProductType.ACCESSIBILITY_AUDIT,
    shortDescription: 'Audit your website for ADA & WCAG compliance',
    description: 'Our expert team conducts comprehensive accessibility audits to ensure your website meets ADA and WCAG compliance standards. Receive a detailed report with actionable recommendations.',
    features: [
      'Manual and automated testing',
      'Expert review by certified professionals',
      'Comprehensive report with evidence',
      'Remediation recommendations',
      'Follow-up consultations',
      'Conformance certification'
    ],
    isPopular: false,
    order: 2,
    iconUrl: '/icons/audit.svg'
  },
  {
    name: 'VPAT',
    type: ProductType.VPAT,
    shortDescription: 'Get accessibility conformance report (ACR)',
    description: 'Our team creates detailed Voluntary Product Accessibility Templates (VPAT) and Accessibility Conformance Reports (ACR) for your digital products, fulfilling procurement requirements and demonstrating compliance.',
    features: [
      'VPAT 2.4 format (latest version)',
      'Section 508, WCAG 2.1, and EN 301 549 reporting',
      'Detailed conformance documentation',
      'Expert evaluation',
      'Remediation guidance',
      'Procurement support'
    ],
    isPopular: false,
    order: 3,
    iconUrl: '/icons/vpat.svg'
  },
  {
    name: 'Litigation Support',
    type: ProductType.LITIGATION_SUPPORT,
    shortDescription: 'Access compliance and technical support for a digital accessibility lawsuit or demand letter',
    description: 'Facing an accessibility lawsuit or demand letter? Our litigation support team provides technical expertise, compliance assessment, and remediation plans to help you respond effectively and resolve issues quickly.',
    features: [
      'Rapid response assessment',
      'Expert testimony',
      'Technical documentation',
      'Remediation planning',
      'Settlement negotiation support',
      'Ongoing compliance monitoring'
    ],
    isPopular: false,
    order: 4,
    iconUrl: '/icons/litigation.svg'
  }
];