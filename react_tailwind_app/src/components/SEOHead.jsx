// SEO Component handles:

import { Helmet } from 'react-helmet-async';


export default function SEOHead({ title, description, path, keywords }) {
  const siteUrl = "https://arduino-animator.netlify.app";
  
  return (
    <Helmet>
      {/* Unique title per page */}
      <title>{title}</title>
      
      {/* Page-specific description */}
      <meta name="description" content={description} />
      
      {/* Correct canonical URL */}
      <link rel="canonical" href={`${siteUrl}${path}`} />
      
      {/* Accurate social sharing */}
      <meta property="og:url" content={`${siteUrl}${path}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      
      {/* Page-specific keywords */}
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
}