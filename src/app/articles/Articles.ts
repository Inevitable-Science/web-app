
export interface Article {
  title: string;
  author: string;
  image: string;
  date: string; // ISO date string
  category: string[];
  overview: string;
  content: string;
}

export interface ArticleSchema {
  articles: Article[];
}

const getRandomImage = () => {
  const images = [
    "/assets/img/articles/article_1.png",
    "/assets/img/articles/article_2.png",
    "/assets/img/articles/article_3.png",
    "/assets/img/articles/article_4.png",
  ];
  return images[Math.floor(Math.random() * images.length)];
};


const articleSchema: ArticleSchema = {
  articles: [
    // Technology
    {
      title: "The Future of AI",
      author: "Alex Carter",
      image: getRandomImage(),
      date: "2025-06-10T14:46:00+10:00", // 6 days ago
      category: ["Technology", "Innovation"],
      overview: "Exploring the rapid advancements in artificial intelligence and its impact on society. Learn how AI is shaping the future.",
      content: `
        <p><strong>The rise of AI</strong> is transforming industries worldwide. <span style="color: #ff5733;">Artificial Intelligence</span> is no longer a distant dream but a present reality, driving innovation in <em>healthcare</em>, <em>finance</em>, and more.</p>
        <p>According to recent studies, <span style="font-weight: bold; color: #28a745;">AI adoption</span> has increased by 30% in the past year. However, challenges remain, such as ethical concerns and job displacement.</p>
        <p><span style="background-color: #e9ecef;">Future implications</span> suggest a blend of human and machine collaboration. Ut enim ad minima veniam, quis nostrum exercitationem?</p>
      `,
    },
    {
      title: "AI in Healthcare",
      author: "Rachel Kim",
      image: getRandomImage(),
      date: "2025-06-12T10:30:00+10:00", // 4 days ago
      category: ["Technology"],
      overview: "Discover how AI is revolutionizing diagnostics and patient care in the healthcare sector.",
      content: `
        <p><strong>AI in medicine</strong> is a game-changer. <span style="color: #17a2b8;">Machine learning</span> enhances diagnostic accuracy in <em>radiology</em> and <em>oncology</em>.</p>
        <p>Studies show <span style="font-weight: bold; color: #dc3545;">40% faster diagnoses</span> with AI tools. Ethical considerations are key to its success.</p>
        <p><span style="background-color: #f8f9fa;">Next steps</span> involve integrating AI into telemedicine. Sed ut perspiciatis unde omnis iste natus error?</p>
      `,
    },
    {
      title: "Quantum Computing Breakthrough",
      author: "James Lee",
      image: getRandomImage(),
      date: "2025-06-14T15:20:00+10:00", // 2 days ago
      category: ["Technology"],
      overview: "A look at the latest advancements in quantum computing and their potential applications.",
      content: `
        <p><strong>Quantum leaps</strong> are here! <span style="color: #6f42c1;">Quantum computing</span> promises to solve complex problems in <em>cryptography</em> and <em>simulation</em>.</p>
        <p><span style="font-weight: bold; color: #fd7e14;">10x speed increase</span> is projected with new hardware. Challenges include error rates and scalability.</p>
        <p><span style="background-color: #dee2e6;">Future potential</span> is vast. Ut enim ad minima veniam, quis nostrum exercitationem?</p>
      `,
    },

    // Innovation
    {
      title: "Innovative Energy Solutions",
      author: "Olivia Brown",
      image: getRandomImage(),
      date: "2025-06-11T11:00:00+10:00", // 5 days ago
      category: ["Innovation"],
      overview: "Exploring cutting-edge energy solutions to combat climate change effectively.",
      content: `
        <p><strong>Energy innovation</strong> is critical. <span style="color: #007bff;">Renewable tech</span> like solar and wind is advancing rapidly.</p>
        <p><span style="font-weight: bold; color: #20c997;">50% efficiency boost</span> noted in recent trials. Collaboration is key to success.</p>
        <p><span style="background-color: #d1ecf1;">Global impact</span> could be transformative. Quis autem vel eum iure reprehenderit?</p>
      `,
    },
    {
      title: "3D Printing Revolution",
      author: "Noah Evans",
      image: getRandomImage(),
      date: "2025-06-13T13:45:00+10:00", // 3 days ago
      category: ["Innovation"],
      overview: "How 3D printing is changing manufacturing and design industries worldwide.",
      content: `
        <p><strong>3D printing</strong> is reshaping production. <span style="color: #ff5733;">Additive manufacturing</span> reduces waste significantly.</p>
        <p><span style="font-weight: bold; color: #28a745;">30% cost reduction</span> reported by early adopters. Scalability remains a challenge.</p>
        <p><span style="background-color: #e9ecef;">Industry shift</span> is underway. Sed ut perspiciatis unde omnis iste natus?</p>
      `,
    },
    {
      title: "Smart Cities Initiative",
      author: "Ava Taylor",
      image: getRandomImage(),
      date: "2025-06-15T09:10:00+10:00", // 1 day ago
      category: ["Innovation"],
      overview: "An overview of smart city projects enhancing urban living with technology.",
      content: `
        <p><strong>Smart cities</strong> use tech for efficiency. <span style="color: #17a2b8;">IoT devices</span> optimize traffic and energy use.</p>
        <p><span style="font-weight: bold; color: #dc3545;">20% energy savings</span> observed in pilot cities. Public adoption is growing.</p>
        <p><span style="background-color: #f8f9fa;">Future vision</span> includes full integration. Ut enim ad minima veniam?</p>
      `,
    },

    // Environment
    {
      title: "Sustainable Living Tips",
      author: "Emma Green",
      image: getRandomImage(),
      date: "2025-06-13T09:15:00+10:00", // 3 days ago
      category: ["Environment", "Lifestyle"],
      overview: "Discover practical tips to live more sustainably and reduce your carbon footprint effectively.",
      content: `
        <p><strong>Going green</strong> is easier than you think! Start by <span style="color: #17a2b8;">reducing waste</span> and embracing renewable energy sources.</p>
        <p><em>Sed ut perspiciatis</em> unde omnis iste natus error sit voluptatem accusantium. Many households can save up to <span style="font-weight: bold; color: #dc3545;">20% on energy bills</span> with simple changes.</p>
        <p><span style="background-color: #f8f9fa;">Long-term benefits</span> include a healthier planet. Quis autem vel eum iure reprehenderit?</p>
      `,
    },
    {
      title: "Ocean Conservation Efforts",
      author: "Lucas Hill",
      image: getRandomImage(),
      date: "2025-06-11T16:00:00+10:00", // 5 days ago
      category: ["Environment"],
      overview: "Learn about global efforts to protect marine ecosystems from pollution and overfishing.",
      content: `
        <p><strong>Ocean health</strong> is vital. <span style="color: #6f42c1;">Conservation projects</span> target plastic waste reduction.</p>
        <p><span style="font-weight: bold; color: #fd7e14;">30% reduction</span> in marine debris reported. Community involvement is crucial.</p>
        <p><span style="background-color: #dee2e6;">Global effort</span> needed. Sed ut perspiciatis unde omnis iste natus?</p>
      `,
    },
    {
      title: "Reforestation Projects",
      author: "Mia Scott",
      image: getRandomImage(),
      date: "2025-06-14T12:30:00+10:00", // 2 days ago
      category: ["Environment"],
      overview: "Explore initiatives to restore forests and combat deforestation worldwide.",
      content: `
        <p><strong>Reforestation</strong> is key to sustainability. <span style="color: #007bff;">Tree planting</span> absorbs CO2 effectively.</p>
        <p><span style="font-weight: bold; color: #20c997;">1 million trees</span> planted last year. Funding remains a challenge.</p>
        <p><span style="background-color: #d1ecf1;">Long-term goal</span> is ecosystem recovery. Ut enim ad minima veniam?</p>
      `,
    },

    // Lifestyle
    {
      title: "Minimalist Living Guide",
      author: "Ethan Ward",
      image: getRandomImage(),
      date: "2025-06-12T08:45:00+10:00", // 4 days ago
      category: ["Lifestyle"],
      overview: "A guide to adopting a minimalist lifestyle for a clutter-free and peaceful life.",
      content: `
        <p><strong>Minimalism</strong> simplifies life. <span style="color: #ff5733;">Declutter</span> your space for mental clarity.</p>
        <p><span style="font-weight: bold; color: #28a745;">50% less stress</span> reported by minimalists. It’s about intentional living.</p>
        <p><span style="background-color: #e9ecef;">Daily practice</span> matters. Sed ut perspiciatis unde omnis iste natus?</p>
      `,
    },
    {
      title: "Healthy Cooking Recipes",
      author: "Isabella Reed",
      image: getRandomImage(),
      date: "2025-06-15T11:00:00+10:00", // 1 day ago
      category: ["Lifestyle"],
      overview: "Delicious and healthy recipes to improve your diet and well-being.",
      content: `
        <p><strong>Healthy eating</strong> is fun. <span style="color: #17a2b8;">Vegan meals</span> are nutrient-rich and tasty.</p>
        <p><span style="font-weight: bold; color: #dc3545;">20% better health</span> with balanced diets. Experiment with spices.</p>
        <p><span style="background-color: #f8f9fa;">Meal prep</span> saves time. Quis autem vel eum iure reprehenderit?</p>
      `,
    },
    {
      title: "Travel on a Budget",
      author: "Mason Clark",
      image: getRandomImage(),
      date: "2025-06-16T10:30:00+10:00", // Today, 10:30 AM AEST
      category: ["Lifestyle"],
      overview: "Tips for affordable travel without sacrificing memorable experiences.",
      content: `
        <p><strong>Budget travel</strong> is achievable. <span style="color: #6f42c1;">Hostels</span> offer affordable stays.</p>
        <p><span style="font-weight: bold; color: #fd7e14;">30% savings</span> with smart planning. Explore local culture.</p>
        <p><span style="background-color: #dee2e6;">Adventure awaits</span>. Ut enim ad minima veniam, quis nostrum?</p>
      `,
    },

    // Finance
    {
      title: "Blockchain Revolution",
      author: "Liam Patel",
      image: getRandomImage(),
      date: "2025-06-15T16:30:00+10:00", // 1 day ago
      category: ["Finance", "Technology"],
      overview: "An in-depth look at how blockchain is revolutionizing financial systems and beyond.",
      content: `
        <p><strong>Blockchain technology</strong> is reshaping finance with <span style="color: #6f42c1;">decentralized systems</span>. It ensures transparency and security like never before.</p>
        <p><em>Nemo enim ipsam</em> voluptatem quia voluptas sit aspernatur aut odit aut fugit. Experts predict a <span style="font-weight: bold; color: #fd7e14;">50% market growth</span> by 2026.</p>
        <p><span style="background-color: #dee2e6;">Global adoption</span> is on the horizon. Ut enim ad minima veniam, quis nostrum?</p>
      `,
    },
    {
      title: "Investing for Beginners",
      author: "Harper Moore",
      image: getRandomImage(),
      date: "2025-06-11T14:00:00+10:00", // 5 days ago
      category: ["Finance"],
      overview: "A beginner's guide to investing wisely and building wealth over time.",
      content: `
        <p><strong>Smart investing</strong> starts here. <span style="color: #007bff;">Stocks</span> offer growth potential.</p>
        <p><span style="font-weight: bold; color: #20c997;">10% returns</span> possible with diversification. Risk management is key.</p>
        <p><span style="background-color: #d1ecf1;">Long-term gains</span> are the goal. Sed ut perspiciatis unde omnis?</p>
      `,
    },
    {
      title: "Crypto Market Trends",
      author: "Ethan Brooks",
      image: getRandomImage(),
      date: "2025-06-13T17:00:00+10:00", // 3 days ago
      category: ["Finance"],
      overview: "An analysis of current trends and future predictions for the cryptocurrency market.",
      content: `
        <p><strong>Crypto trends</strong> are shifting. <span style="color: #ff5733;">Bitcoin</span> leads with stability.</p>
        <p><span style="font-weight: bold; color: #28a745;">20% volatility</span> expected this year. Diversify your portfolio.</p>
        <p><span style="background-color: #e9ecef;">Future outlook</span> is promising. Quis autem vel eum iure?</p>
      `,
    },

    // Health
    {
      title: "Mindfulness Practices",
      author: "Sophie Lee",
      image: getRandomImage(),
      date: "2025-06-16T14:00:00+10:00", // Today, 2:00 PM AEST
      category: ["Health", "Wellness"],
      overview: "Learn mindfulness techniques to improve mental health and reduce stress in daily life.",
      content: `
        <p><strong>Mindfulness</strong> can transform your well-being. Practice <span style="color: #007bff;">meditation</span> for just 10 minutes daily.</p>
        <p><em>Quis autem vel</em> eum iure reprehenderit qui in ea voluptate velit esse. Studies show a <span style="font-weight: bold; color: #20c997;">25% stress reduction</span> with regular practice.</p>
        <p><span style="background-color: #d1ecf1;">Daily habits</span> matter. Sed ut perspiciatis unde omnis iste natus?</p>
      `,
    },
    {
      title: "Fitness Routines for All",
      author: "Chloe Adams",
      image: getRandomImage(),
      date: "2025-06-10T09:00:00+10:00", // 6 days ago
      category: ["Health"],
      overview: "Simple fitness routines suitable for all fitness levels to stay active.",
      content: `
        <p><strong>Fitness for all</strong> is achievable. <span style="color: #17a2b8;">Yoga</span> improves flexibility and strength.</p>
        <p><span style="font-weight: bold; color: #dc3545;">15 minutes daily</span> can transform your health. Consistency is key.</p>
        <p><span style="background-color: #f8f9fa;">Health benefits</span> are numerous. Ut enim ad minima veniam?</p>
      `,
    },
    {
      title: "Nutrition Basics",
      author: "Daniel White",
      image: getRandomImage(),
      date: "2025-06-14T08:15:00+10:00", // 2 days ago
      category: ["Health"],
      overview: "Essential nutrition tips to maintain a balanced diet and boost immunity.",
      content: `
        <p><strong>Healthy eating</strong> starts with basics. <span style="color: #6f42c1;">Vitamins</span> strengthen your immune system.</p>
        <p><span style="font-weight: bold; color: #fd7e14;">30% better immunity</span> with proper diet. Avoid processed foods.</p>
        <p><span style="background-color: #dee2e6;">Daily intake</span> matters. Sed ut perspiciatis unde omnis?</p>
      `,
    },

    // Wellness
    {
      title: "Yoga for Stress Relief",
      author: "Zoe Harris",
      image: getRandomImage(),
      date: "2025-06-12T15:30:00+10:00", // 4 days ago
      category: ["Wellness"],
      overview: "How yoga can help reduce stress and improve overall well-being.",
      content: `
        <p><strong>Yoga benefits</strong> are profound. <span style="color: #007bff;">Poses</span> like downward dog relieve tension.</p>
        <p><span style="font-weight: bold; color: #20c997;">20% stress drop</span> noted in studies. Practice regularly.</p>
        <p><span style="background-color: #d1ecf1;">Mental peace</span> follows. Quis autem vel eum iure?</p>
      `,
    },
    {
      title: "Meditation Techniques",
      author: "Jack Wilson",
      image: getRandomImage(),
      date: "2025-06-15T13:00:00+10:00", // 1 day ago
      category: ["Wellness"],
      overview: "Effective meditation techniques to enhance focus and inner calm.",
      content: `
        <p><strong>Meditation</strong> boosts focus. <span style="color: #ff5733;">Mindfulness</span> techniques are simple to learn.</p>
        <p><span style="font-weight: bold; color: #28a745;">15% focus increase</span> with daily practice. Silence is key.</p>
        <p><span style="background-color: #e9ecef;">Inner calm</span> is achievable. Sed ut perspiciatis unde omnis?</p>
      `,
    },
    {
      title: "Sleep Hygiene Tips",
      author: "Lily Turner",
      image: getRandomImage(),
      date: "2025-06-16T09:45:00+10:00", // Today, 9:45 AM AEST
      category: ["Wellness"],
      overview: "Improve your sleep quality with these essential hygiene tips.",
      content: `
        <p><strong>Sleep health</strong> is crucial. <span style="color: #17a2b8;">Routine</span> helps regulate your body clock.</p>
        <p><span style="font-weight: bold; color: #dc3545;">30% better rest</span> with good habits. Avoid screens before bed.</p>
        <p><span style="background-color: #f8f9fa;">Restful nights</span> improve productivity. Ut enim ad minima veniam?</p>
      `,
    },
  ],
};

export default articleSchema;