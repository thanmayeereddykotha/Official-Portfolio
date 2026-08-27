/**
 * Thanmayee Portfolio - Google Sheets Project CMS
 * Enables zero-code updates from a Google Sheet CSV or uses default high-impact data projects.
 */

window.PORTFOLIO_CONFIG = {
  // If you publish a Google Sheet to the web (File -> Share -> Publish to web as CSV),
  // paste your Sheet ID or public CSV URL here:
  googleSheetCsvUrl: '', 
  githubUsername: 'thanmayeereddykotha'
};

const DEFAULT_PROJECTS = [
  {
    name: 'Sales Intelligence & Revenue Forecasting',
    description: 'Predictive time-series modeling and statistical forecasting across multi-channel retail operations to optimize quarterly working capital.',
    category: 'Data Analytics',
    media_type: 'image',
    media_url: 'https://cdn.prod.website-files.com/68924abc8a62e2a2be385f9a/6a8c21c6e9d8240efb9f0db3_flytech-cover.webp',
    github_link: 'https://github.com/thanmayeereddykotha',
    live_link: '',
    role_tags: ['Python', 'Time-Series ARIMA', 'Financial Modeling', 'ETL'],
    featured: true
  },
  {
    name: 'Bhoomimitra Agri-Telemetry Platform',
    description: 'Data analytics platform processing crop sensor telemetry, soil condition indices, and weather trends to maximize crop yield efficiency.',
    category: 'Data Analytics',
    media_type: 'image',
    media_url: 'https://cdn.prod.website-files.com/68924abc8a62e2a2be385f9a/6a858283ff9aec26afbb7ebd_brilean-cover.webp',
    github_link: 'https://github.com/thanmayeereddykotha/bhoomimitra',
    live_link: '',
    role_tags: ['Data Pipeline', 'Geospatial Analytics', 'Product Strategy', 'Python'],
    featured: true
  },
  {
    name: 'Executive KPI & Financial BI Dashboard',
    description: 'Interactive business intelligence dashboard connecting PostgreSQL to Power BI for real-time monitoring of CAC, LTV, and churn rates.',
    category: 'BI & Dashboards',
    media_type: 'image',
    media_url: 'https://cdn.prod.website-files.com/68924abc8a62e2a2be385f9a/6a8587a46207671457f10e52_modern-cover.webp',
    github_link: 'https://github.com/thanmayeereddykotha',
    live_link: '',
    role_tags: ['Power BI', 'SQL Server', 'Cohort Analysis', 'Executive Reporting'],
    featured: true
  },
  {
    name: 'Customer Lifetime Value & RFM Segmentation',
    description: 'Machine learning segmentation engine using K-Means and RFM metrics to cluster enterprise client tiers and drive targeted upsell strategies.',
    category: 'Business Strategy',
    media_type: 'image',
    media_url: 'https://cdn.prod.website-files.com/68924abc8a62e2a2be385f9a/6aa276146dae5a19a6c3eba6_supermodular-thumbnail-16x9.webp',
    github_link: 'https://github.com/thanmayeereddykotha',
    live_link: '',
    role_tags: ['Machine Learning', 'Customer Analytics', 'GTM Strategy', 'Pandas'],
    featured: true
  },
  {
    name: 'MeritPath Career Analytics Framework',
    description: 'Decision modeling and labor market analytics platform identifying skill gap trajectories and career path progression paths.',
    category: 'Business Strategy',
    media_type: 'image',
    media_url: 'https://cdn.prod.website-files.com/68924abc8a62e2a2be385f9a/6a8583fbff9aec26afbc5c90_sensei-cover.webp',
    github_link: 'https://github.com/thanmayeereddykotha/MeritPath',
    live_link: '',
    role_tags: ['Market Research', 'Data Modeling', 'Strategic Operations', 'Python'],
    featured: true
  },
  {
    name: 'Supply Chain Logistics & Route Optimization',
    description: 'Linear programming and geospatial optimization model reducing delivery transit bottlenecks and transportation fuel overhead by 18%.',
    category: 'Data Analytics',
    media_type: 'image',
    media_url: 'https://cdn.prod.website-files.com/68924abc8a62e2a2be385f9a/6aa17b1896fa22ae33e4427b_quill-orki-thumbnail.webp',
    github_link: 'https://github.com/thanmayeereddykotha',
    live_link: '',
    role_tags: ['Operations Research', 'Optimization', 'Tableau', 'SQL'],
    featured: true
  }
];

window.getPortfolioProjects = async function () {
  const url = window.PORTFOLIO_CONFIG.googleSheetCsvUrl;
  if (!url) {
    return DEFAULT_PROJECTS;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return DEFAULT_PROJECTS;

    const headers = rows[0].map(h => h.trim().toLowerCase());
    return rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ? row[i].trim() : '';
      });
      return {
        name: obj.name || 'Untitled Project',
        description: obj.description || '',
        category: obj.category || 'Data Analytics',
        media_type: obj.media_type || 'image',
        media_url: obj.media_url || DEFAULT_PROJECTS[0].media_url,
        github_link: obj.github_link || 'https://github.com/thanmayeereddykotha',
        live_link: obj.live_link || '',
        role_tags: obj.role_tags ? obj.role_tags.split(',').map(t => t.trim()) : ['Data Analytics'],
        featured: obj.featured === 'true' || obj.featured === 'yes' || obj.featured === '1'
      };
    });
  } catch (err) {
    console.warn('Could not fetch Google Sheet CSV, using default projects:', err);
    return DEFAULT_PROJECTS;
  }
};

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal);
      rows.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  return rows;
}
