export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const defaults = {
  title: 'Saint Patrick\'s Academy',
  description: 'Quality Catholic education for Junior and Senior High School students in San Francisco, Agusan del Sur.',
  keywords: 'Saint Patrick Academy, Catholic school, Junior High School, Senior High School, Agusan del Sur, enrollment, education',
  image: '/og-image.png',
  siteName: 'Saint Patrick\'s Academy',
  siteUrl: 'https://stpatrickacademy.edu.ph'
};

export function generateMetaTags(props: SEOProps = {}) {
  const title = props.title 
    ? `${props.title} - ${defaults.title}`
    : `${defaults.title} - Quality Catholic Education`;
    
  const description = props.description || defaults.description;
  const keywords = props.keywords || defaults.keywords;
  const image = props.image || defaults.image;
  const url = props.url ? `${defaults.siteUrl}${props.url}` : defaults.siteUrl;
  const type = props.type || 'website';
  
  return {
    title,
    description,
    keywords,
    image: image.startsWith('http') ? image : `${defaults.siteUrl}${image}`,
    url,
    type,
    author: props.author,
    publishedTime: props.publishedTime,
    modifiedTime: props.modifiedTime
  };
}

// JSON-LD Schema for structured data
export function generateSchemaOrg(type: 'School' | 'NewsArticle' | 'Person', data: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type
  };
  
  switch (type) {
    case 'School':
      return {
        ...baseSchema,
        name: 'Saint Patrick\'s Academy, Inc.',
        description: defaults.description,
        url: defaults.siteUrl,
        logo: `${defaults.siteUrl}/logo.png`,
        sameAs: [
          'https://www.facebook.com/stpatrickacademy'
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'San Francisco',
          addressLocality: 'San Francisco',
          addressRegion: 'Agusan del Sur',
          addressCountry: 'PH'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+63-85-XXX-XXXX',
          contactType: 'Admissions',
          areaServed: 'PH',
          availableLanguage: ['English', 'Filipino']
        }
      };
      
    case 'NewsArticle':
      return {
        ...baseSchema,
        headline: data.title,
        description: data.excerpt,
        image: data.image,
        datePublished: data.publishedDate,
        dateModified: data.modifiedDate,
        author: {
          '@type': 'Person',
          name: data.author
        },
        publisher: {
          '@type': 'Organization',
          name: 'Saint Patrick\'s Academy',
          logo: {
            '@type': 'ImageObject',
            url: `${defaults.siteUrl}/logo.png`
          }
        }
      };
      
    case 'Person':
      return {
        ...baseSchema,
        name: data.name,
        jobTitle: data.position,
        worksFor: {
          '@type': 'Organization',
          name: 'Saint Patrick\'s Academy'
        },
        email: data.email,
        image: data.imageUrl
      };
      
    default:
      return baseSchema;
  }
}