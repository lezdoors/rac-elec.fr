/**
 * WebP Image Converter for Mobile Performance
 * Converts images to WebP format with responsive sizes
 */

export const generateWebPSources = (originalSrc: string) => {
  const baseName = originalSrc.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  const extension = originalSrc.match(/\.(jpg|jpeg|png|gif)$/i)?.[1] || 'jpg';
  
  return {
    mobile: {
      webp: `${baseName}_320w.webp 320w, ${baseName}_640w.webp 640w`,
      fallback: `${baseName}_320w.${extension} 320w, ${baseName}_640w.${extension} 640w`,
      sizes: '100vw'
    },
    tablet: {
      webp: `${baseName}_768w.webp 768w, ${baseName}_1024w.webp 1024w`,
      fallback: `${baseName}_768w.${extension} 768w, ${baseName}_1024w.${extension} 1024w`,
      sizes: '100vw'
    },
    desktop: {
      webp: `${baseName}_1280w.webp 1280w, ${baseName}_1920w.webp 1920w`,
      fallback: `${baseName}_1280w.${extension} 1280w, ${baseName}_1920w.${extension} 1920w`,
      sizes: '100vw'
    }
  };
};

export const createResponsiveImage = (src: string, alt: string, priority = false) => {
  const sources = generateWebPSources(src);
  
  const picture = document.createElement('picture');
  
  // Mobile WebP source
  const mobileSource = document.createElement('source');
  mobileSource.media = '(max-width: 767px)';
  mobileSource.srcset = sources.mobile.webp;
  mobileSource.sizes = sources.mobile.sizes;
  mobileSource.type = 'image/webp';
  picture.appendChild(mobileSource);
  
  // Tablet WebP source
  const tabletSource = document.createElement('source');
  tabletSource.media = '(max-width: 1199px)';
  tabletSource.srcset = sources.tablet.webp;
  tabletSource.sizes = sources.tablet.sizes;
  tabletSource.type = 'image/webp';
  picture.appendChild(tabletSource);
  
  // Desktop WebP source
  const desktopSource = document.createElement('source');
  desktopSource.srcset = sources.desktop.webp;
  desktopSource.sizes = sources.desktop.sizes;
  desktopSource.type = 'image/webp';
  picture.appendChild(desktopSource);
  
  // Fallback img
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = priority ? 'eager' : 'lazy';
  img.decoding = 'async';
  if (priority && 'fetchPriority' in img) {
    (img as any).fetchPriority = 'high';
  }
  picture.appendChild(img);
  
  return picture;
};

export const optimizeExistingImages = () => {
  const images = document.querySelectorAll('img:not([data-webp-optimized])');
  
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;
    const src = htmlImg.src;
    const alt = htmlImg.alt;
    const priority = index === 0; // First image is LCP candidate
    
    // Create responsive picture element
    const picture = createResponsiveImage(src, alt, priority);
    picture.className = htmlImg.className;
    
    // Replace original img with picture
    htmlImg.parentNode?.replaceChild(picture, htmlImg);
    
    // Mark as optimized
    picture.setAttribute('data-webp-optimized', 'true');
  });
};