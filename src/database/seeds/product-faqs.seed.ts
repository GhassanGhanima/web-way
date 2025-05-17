import { ProductType } from '@app/modules/products/entities/product.entity';

export const productFaqsSeed = {
  [ProductType.ACCESSIBILITY_WIDGET]: [
    {
      question: "How do I install the Accessibility Widget on my website?",
      answer: "Installing our widget is simple. Just add a single line of JavaScript to your website's header or footer: `<script src=\"https://cdn.accessibilitytool.com/widget.js?apiKey=YOUR_API_KEY\" async></script>`. Replace YOUR_API_KEY with the key provided in your dashboard."
    },
    {
      question: "Is the Accessibility Widget customizable?",
      answer: "Yes, the widget is fully customizable. You can adjust the position, colors, features enabled, and more through your dashboard or via configuration parameters."
    },
    {
      question: "Does the Accessibility Widget slow down my website?",
      answer: "No, our widget is designed to load asynchronously and has minimal impact on page load times. It's typically less than 30KB in size and uses efficient code to ensure optimal performance."
    }
  ],
  [ProductType.ACCESSIBILITY_MONITOR]: [
    {
      question: "How often does the Accessibility Monitor scan my website?",
      answer: "By default, the Accessibility Monitor performs weekly scans, but you can configure it to run daily, weekly, or monthly based on your needs. You can also initiate manual scans at any time."
    },
    {
      question: "What types of issues does the Accessibility Monitor detect?",
      answer: "Our monitor detects a wide range of accessibility issues, including but not limited to: missing alt text, low contrast text, keyboard navigation problems, missing ARIA attributes, and form input issues. It covers WCAG 2.1 A, AA, and AAA criteria."
    },
    {
      question: "Can I integrate the Accessibility Monitor with my CI/CD pipeline?",
      answer: "Yes, we provide API access and integrations with popular CI/CD tools like GitHub Actions, Jenkins, and GitLab CI. This allows you to check for accessibility issues before deploying code."
    }
  ],
  [ProductType.ACCESSIBILITY_AUDIT]: [
    {
      question: "What's included in an Accessibility Audit?",
      answer: "Our comprehensive audit includes: automated scanning, manual testing by certified experts, detailed reporting of issues found, conformance assessment against WCAG 2.1 AA standards, prioritized remediation recommendations, and a 60-minute consultation to review findings."
    },
    {
      question: "How long does an Accessibility Audit take to complete?",
      answer: "Typically, our audits take 2-3 weeks to complete, depending on the size and complexity of your website. We'll provide a specific timeline estimate after our initial assessment."
    },
    {
      question: "Do you provide remediation support after the audit?",
      answer: "Yes, we offer remediation support as an additional service. Our team can help implement the recommended changes or provide guidance to your development team on how to address identified issues."
    }
  ],
  [ProductType.VPAT]: [
    {
      question: "What is a VPAT and why do I need one?",
      answer: "A Voluntary Product Accessibility Template (VPAT) is a document that explains how information and communication technology (ICT) products such as software, hardware, electronic content, and support documentation meet (conform to) the Revised 508 Standards for IT accessibility. Many organizations, especially government agencies and educational institutions, require VPATs during procurement."
    },
    {
      question: "What standards do your VPATs cover?",
      answer: "Our VPATs follow the VPAT 2.4 format and can cover: Section 508 (U.S. Federal), WCAG 2.1 (Web Content Accessibility Guidelines), EN 301 549 (European Union), and the 21st Century Integrated Digital Experience Act requirements."
    },
    {
      question: "How often should a VPAT be updated?",
      answer: "We recommend updating your VPAT annually or whenever significant changes are made to your product. This ensures the information remains current for procurement purposes."
    }
  ],
  [ProductType.LITIGATION_SUPPORT]: [
    {
      question: "I've received a demand letter about website accessibility. What should I do?",
      answer: "Contact us immediately. Our litigation support team can help assess the situation, document current compliance status, develop a remediation plan, and provide expert guidance throughout the process. Quick action is important to demonstrate good faith efforts toward compliance."
    },
    {
      question: "Can your experts serve as witnesses in accessibility lawsuits?",
      answer: "Yes, our team includes certified accessibility experts who can serve as expert witnesses in litigation. They can provide testimony regarding technical compliance, industry standards, and reasonable accommodations."
    },
    {
      question: "What's your typical approach to handling accessibility litigation?",
      answer: "Our approach includes: 1) Initial assessment of the complaint and your website's compliance status; 2) Documentation of existing accessibility features; 3) Development of a remediation plan with timeline; 4) Implementation of critical fixes; 5) Support for settlement negotiations; and 6) Ongoing compliance monitoring to prevent future issues."
    }
  ]
};