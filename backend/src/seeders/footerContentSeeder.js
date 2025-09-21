const { FooterContent } = require('../models');

const seedFooterContent = async () => {
  try {
    console.log('Seeding footer content...');

    const footerContentData = [
      // Social Media Links
      {
        type: 'social_media',
        key: 'facebook',
        value: 'https://facebook.com/wecure',
        label: 'Facebook',
        order: 1,
        metadata: { icon: 'FaFacebookF', color: '#3b5998' }
      },
      {
        type: 'social_media',
        key: 'twitter',
        value: 'https://twitter.com/wecure',
        label: 'Twitter',
        order: 2,
        metadata: { icon: 'FaTwitter', color: '#1da1f2' }
      },
      {
        type: 'social_media',
        key: 'linkedin',
        value: 'https://linkedin.com/company/wecure',
        label: 'LinkedIn',
        order: 3,
        metadata: { icon: 'FaLinkedinIn', color: '#0077b5' }
      },
      {
        type: 'social_media',
        key: 'instagram',
        value: 'https://instagram.com/wecure',
        label: 'Instagram',
        order: 4,
        metadata: { icon: 'FaInstagram', color: '#e1306c' }
      },

      // Company Information
      {
        type: 'company_info',
        key: 'company_name',
        value: 'WeCure',
        label: 'Company Name',
        order: 1
      },
      {
        type: 'company_info',
        key: 'tagline',
        value: 'Your trusted partner for expert consultations across healthcare, wellness, and more.',
        label: 'Company Tagline',
        order: 2
      },
      {
        type: 'company_info',
        key: 'copyright',
        value: '© 2024 WeCure. All rights reserved.',
        label: 'Copyright Text',
        order: 3
      },

      // Quick Links
      {
        type: 'quick_links',
        key: 'support_24_7',
        value: '/direct/24/7support',
        label: '24/7 Support',
        order: 1
      },
      {
        type: 'quick_links',
        key: 'about_us',
        value: '/direct/aboutus',
        label: 'About Us',
        order: 2
      },
      {
        type: 'quick_links',
        key: 'services',
        value: '/direct/services',
        label: 'Services',
        order: 3
      },
      {
        type: 'quick_links',
        key: 'doctors',
        value: '/direct/doctors',
        label: 'Doctors',
        order: 4
      },
      {
        type: 'quick_links',
        key: 'blog',
        value: '/direct/blog',
        label: 'Blog',
        order: 5
      },
      {
        type: 'quick_links',
        key: 'careers',
        value: '/direct/careers',
        label: 'Careers',
        order: 6
      },
      {
        type: 'quick_links',
        key: 'contact_us',
        value: '/direct/contactus',
        label: 'Contact Us',
        order: 7
      },
      {
        type: 'quick_links',
        key: 'advertisement',
        value: '/direct/advertisement',
        label: 'Advertisement',
        order: 8
      },

      // Contact Information
      {
        type: 'contact_info',
        key: 'newsletter_title',
        value: 'NEWSLETTER',
        label: 'Newsletter Section Title',
        order: 1
      },
      {
        type: 'contact_info',
        key: 'newsletter_description',
        value: 'Subscribe to get the latest updates.',
        label: 'Newsletter Description',
        order: 2
      },
      {
        type: 'contact_info',
        key: 'support_title',
        value: 'SUPPORT',
        label: 'Support Section Title',
        order: 3
      },
      {
        type: 'contact_info',
        key: 'live_chat_text',
        value: 'Live Chat',
        label: 'Live Chat Button Text',
        order: 4
      }
    ];

    for (const content of footerContentData) {
      await FooterContent.findOrCreate({
        where: { type: content.type, key: content.key },
        defaults: content
      });
    }

    console.log('Footer content seeded successfully!');
  } catch (error) {
    console.error('Error seeding footer content:', error);
  }
};

module.exports = { seedFooterContent };
