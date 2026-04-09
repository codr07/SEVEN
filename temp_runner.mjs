
    const document = { 
        createElement: () => ({ className: '', append: () => {}, appendChild: () => {}, querySelector: () => null }),
        getElementById: () => ({ innerHTML: '', addEventListener: () => {}, append: () => {}, querySelector: () => null, classList: { add: ()=>{}, remove: ()=>{} } })
    };
    const window = {};
    const escapeHtml = (s) => s;
    const sanitizeUrl = (s) => s;
    const URL = String;

    function sanitizeStr(str) {
        if (str === null || str === undefined) return 'NULL';
        if (typeof str !== 'string') str = String(str);
        return "'" + str.replace(/'/g, "''") + "'";
    }

    function objToJson(obj) {
        if (!obj) return 'NULL';
        return "'" + JSON.stringify(obj).replace(/'/g, "''") + "'::jsonb";
    }

    let outSql = "-- AUTO-GENERATED SEED DATA\n\n";

        // --- courses ---
        (() => {
            

const courses = [
  {
    category: "Coding Language Course",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Rapid Lang",
        short_desc: "Basic Language Course of your choice - 3 Months",
        details: [
          "Introduction to programming concepts",
          "Syntax and basic constructs",
          "Variables, data types, and operators",
          "Control structures: loops and conditional statements",
          "Functions and modular programming",
        ],
        duration: "3 Months",
        price: "₹5,999",
        link: "https://topmate.io/seven_oz/1980006",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Rapid Lang: Intensive 3-Month Programming Course",
          short_desc:
            "Master programming fundamentals in your chosen language with hands-on projects and expert mentorship.",
          details: [
            "Learn programming fundamentals in your chosen language",
            "Hands-on projects to reinforce concepts",
            "Expert mentorship and feedback",
            "Structured learning path for beginners",
          ],
          why_choose_this_course:
            "This course is designed for beginners who want to learn programming in a structured and practical way.",
          certification_available: true,
          certification_cost: "₹1,999",
          public_review:
            "Students consistently rate this course highly for its clarity, practical approach, and expert mentorship.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Data Structures and Algorithms (DSA)",
        short_desc:
          "Master core DSA concepts for coding interviews and problem solving.",
        details: [
          "Introduction to data structures (arrays, linked lists, stacks, queues)",
          "Basic algorithms (sorting, searching)",
          "Advanced data structures (trees, graphs)",
          "Algorithm design techniques (greedy, etc.)",
        ],
        duration: "5 Months",
        price: "₹6,499",
        link: "https://topmate.io/seven_oz/1980024",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Data Structures and Algorithms (DSA)",
          short_desc:
            "Master core DSA concepts for coding interviews and problem solving.",
          details: [
            "Introduction to data structures (arrays, linked lists, stacks, queues)",
            "Basic algorithms (sorting, searching)",
            "Advanced data structures (trees, graphs)",
            "Algorithm design techniques (greedy, etc.)",
          ],
          why_choose_this_course:
            "This course is designed for students preparing for coding interviews and those looking to strengthen their problem-solving skills.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students find this course highly effective in building a strong foundation in DSA concepts.",
        },
      },
    ],
  },
  {
    category: "Web Development",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Basic - Rookie",
        short_desc:
          "Learn HTML and CSS fundamentals to build responsive static websites.",
        details: [
          "HTML, CSS fundamentals",
          "Introduction to responsive design",
          "Building static web pages",
        ],
        duration: "2 Months",
        price: "₹5,999",
        link: "https://topmate.io/seven_oz/1984758",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Basic Web Development",
          short_desc:
            "Learn HTML and CSS fundamentals to build responsive static websites.",
          details: [
            "HTML, CSS fundamentals",
            "Introduction to responsive design",
            "Building static web pages",
          ],
          why_choose_this_course:
            "This course is designed for beginners who want to learn the basics of web development.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its clear explanations and practical approach.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Web - Diamond",
        short_desc:
          "Build dynamic frontend apps with modern JavaScript and async programming.",
        details: [
          "JavaScript fundamentals",
          "DOM manipulation",
          "Asynchronous programming (Promises, async/await)",
        ],
        duration: "4 Months",
        price: "₹21,999",
        link: "https://topmate.io/seven_oz/1984977",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Web - Diamond",
          short_desc:
            "Build dynamic frontend apps with modern JavaScript and async programming.",
          details: [
            "JavaScript fundamentals",
            "DOM manipulation",
            "Asynchronous programming (Promises, async/await)",
          ],
          why_choose_this_course:
            "This course is designed for students who have a basic understanding of frontend development and want to build more complex applications.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its practical approach and deep dive into modern JavaScript concepts.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "React Dom",
        short_desc:
          "Create reusable UI components and manage app state with React.",
        details: [
          "Introduction to React framework",
          "JSX syntax and components",
          "State management with Redux",
        ],
        duration: "4 Months",
        price: "₹22,999",
        link: "https://topmate.io/seven_oz/1984978",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "React Dom",
          short_desc:
            "Create reusable UI components and manage app state with React.",
          details: [
            "Introduction to React framework",
            "JSX syntax and components",
            "State management with Redux",
          ],
          why_choose_this_course:
            "This course is designed for students who want to learn React and build modern web applications.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its clear explanations and practical projects using React.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "MERN Stack Development",
        short_desc:
          "Develop complete web applications using MongoDB, Express, React, and Node.",
        details: [
          "MongoDB fundamentals",
          "Express.js basics",
          "Node.js backend development",
          "Integration with React frontend",
        ],
        duration: "5 Months",
        price: "₹54,999",
        link: "https://topmate.io/seven_oz/1984979",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "MERN Stack Development",
          short_desc:
            "Develop complete web applications using MongoDB, Express, React, and Node.",
          details: [
            "MongoDB fundamentals",
            "Express.js basics",
            "Node.js backend development",
            "Integration with React frontend",
          ],
          why_choose_this_course:
            "This course is designed for students who want to build full-stack web applications using the MERN stack.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its comprehensive coverage of the MERN stack and practical projects.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Full Stack Development",
        short_desc:
          "Become a full stack developer with APIs, auth, and deployment workflows.",
        details: [
          "RESTful API design and implementation",
          "Authentication and authorization",
          "Deployment strategies and continuous integration",
        ],
        duration: "8-9 Months",
        price: "₹44,999",
        link: "https://topmate.io/seven_oz/1984980",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Full Stack Development",
          short_desc:
            "Become a full stack developer with APIs, auth, and deployment workflows.",
          details: [
            "RESTful API design and implementation",
            "Authentication and authorization",
            "Deployment strategies and continuous integration",
          ],
          why_choose_this_course:
            "This course is designed for students who want to become proficient full stack developers and learn about APIs, authentication, and deployment.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its in-depth coverage of full stack development concepts and practical approach.",
        },
      },
    ],
  },
  {
    category: "Mathematical Aptitude",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Numerical Analysis",
        short_desc:
          "Strengthen problem-solving with practical numerical computation techniques.",
        details: [
          "Numerical methods for solving equations",
          "Interpolation and approximation techniques",
          "Numerical differentiation and integration",
        ],
        duration: "1 Month",
        price: "₹1,999",
        link: "https://topmate.io/seven_oz/1984981",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Numerical Analysis",
          short_desc:
            "Strengthen problem-solving with practical numerical computation techniques.",
          details: [
            "Numerical methods for solving equations",
            "Interpolation and approximation techniques",
            "Numerical differentiation and integration",
          ],
          why_choose_this_course:
            "This course is designed for students who want to improve their mathematical problem-solving skills with practical numerical methods.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students find this course highly effective in enhancing their numerical problem-solving abilities.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Statistics",
        short_desc:
          "Understand probability and statistics for analytics and decision making.",
        details: [
          "Descriptive statistics (mean, median, mode)",
          "Probability theory",
          "Inferential statistics (Chi Square Distribution, hypothesis testing)",
        ],
        duration: "5 Months",
        price: "₹2,499",
        link: "https://topmate.io/seven_oz/1984983",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Statistics",
          short_desc:
            "Understand probability and statistics for analytics and decision making.",
          details: [
            "Descriptive statistics (mean, median, mode)",
            "Probability theory",
            "Inferential statistics (Chi Square Distribution, hypothesis testing)",
          ],
          why_choose_this_course:
            "This course is designed for students who want to learn the fundamentals of statistics for data analysis and informed decision making.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its clear explanations and practical approach to learning statistics.",
        },
      },
    ],
  },
  {
    category: "ML/AI",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Machine Learning Basics",
        short_desc:
          "Start your ML journey with supervised models and evaluation basics.",
        details: [
          "Introduction to machine learning",
          "Linear regression, logistic regression",
          "Model evaluation and validation techniques",
        ],
        duration: "3 Months",
        price: "₹12,999",
        link: "https://topmate.io/seven_oz/1984996",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Machine Learning Basics",
          short_desc:
            "Start your ML journey with supervised models and evaluation basics.",
          details: [
            "Introduction to machine learning",
            "Linear regression, logistic regression",
            "Model evaluation and validation techniques",
          ],
          why_choose_this_course:
            "This course is designed for beginners who want to start learning machine learning concepts and techniques.",
          certification_available: true,
          certification_cost: "₹1,199",
          public_review:
            "Students consistently rate this course highly for its clear explanations and practical approach to learning machine learning basics.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Advanced Machine Learning",
        short_desc:
          "Go deeper into advanced ML algorithms and model optimization methods.",
        details: [
          "Decision trees and ensemble methods",
          "Support Vector Machines (SVM)",
          "Neural networks and deep learning basics",
        ],
        duration: "5 Months",
        price: "₹26,999",
        link: "https://topmate.io/seven_oz/1984997",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Advanced Machine Learning",
          short_desc:
            "Go deeper into advanced ML algorithms and model optimization methods.",
          details: [
            "Decision trees and ensemble methods",
            "Support Vector Machines (SVM)",
            "Neural networks and deep learning basics",
          ],
          why_choose_this_course:
            "This course is designed for students who want to go deeper into advanced machine learning algorithms and model optimization techniques.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its comprehensive coverage of advanced machine learning concepts.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "AI Development",
        short_desc:
          "Build AI-driven solutions with NLP and computer vision foundations.",
        details: [
          "Natural Language Processing (NLP) basics",
          "Computer Vision fundamentals",
        ],
        duration: "5 Months",
        price: "₹27,999",
        link: "https://topmate.io/seven_oz/1985001",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "AI Development",
          short_desc:
            "Build AI-driven solutions with NLP and computer vision foundations.",
          details: [
            "Natural Language Processing (NLP) basics",
            "Computer Vision fundamentals",
          ],
          why_choose_this_course:
            "This course is designed for students who want to build AI-driven solutions using NLP and computer vision techniques.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its practical approach to building AI applications.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Machine Learning with R",
        short_desc:
          "Apply ML workflows in R for data analysis and predictive modeling.",
        details: [
          "R programming language basics",
          "Data manipulation with tidyverse",
          "Statistical modeling and machine learning packages",
        ],
        duration: "3 Months",
        price: "₹15,999",
        link: "https://topmate.io/seven_oz/1985003",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Machine Learning with R",
          short_desc:
            "Apply ML workflows in R for data analysis and predictive modeling.",
          details: [
            "R programming language basics",
            "Data manipulation with tidyverse",
            "Statistical modeling and machine learning packages",
          ],
          why_choose_this_course:
            "This course is designed for students who want to learn how to apply machine learning workflows using the R programming language.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its clear explanations and practical approach to learning machine learning with R.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Machine Learning with Python",
        short_desc:
          "Use Python tools and frameworks to develop practical ML models.",
        details: [
          "Python libraries for data analysis (NumPy, Pandas)",
          "Scikit-learn for machine learning",
          "Deep learning frameworks (TensorFlow, PyTorch)",
        ],
        duration: "5 Months",
        price: "₹28,999",
        link: "https://topmate.io/seven_oz/1985004",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Machine Learning with Python",
          short_desc:
            "Use Python tools and frameworks to develop practical ML models.",
          details: [
            "Python libraries for data analysis (NumPy, Pandas)",
            "Scikit-learn for machine learning",
            "Deep learning frameworks (TensorFlow, PyTorch)",
          ],
          why_choose_this_course:
            "This course is designed for learners who want to build and deploy machine learning solutions using Python.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students rate this course highly for practical coding exercises and real-world machine learning workflows.",
        },
      },
    ],
  },
  {
    category: "Design",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Graphic Design",
        short_desc:
          "Learn design fundamentals and tools to create visual assets.",
        details: ["Design principles and elements", "Adobe Illustrator basics"],
        duration: "2 Months",
        price: "₹11,999",
        link: "https://topmate.io/seven_oz/1985005",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Graphic Design",
          short_desc:
            "Learn design fundamentals and tools to create visual assets.",
          details: [
            "Design principles and elements",
            "Adobe Illustrator basics",
          ],
          why_choose_this_course:
            "This course helps learners build strong visual design fundamentals with hands-on creative tasks.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Learners appreciate the structured approach and practical assignments for building a design portfolio.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "UI/UX Design",
        short_desc:
          "Design intuitive user interfaces and improve digital user experiences.",
        details: [
          "User interface design fundamentals",
          "Usability principles",
          "Prototyping tools (Adobe XD, Sketch)",
        ],
        duration: "2 Months",
        price: "₹12,999",
        link: "https://topmate.io/seven_oz/1985006",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "UI/UX Design",
          short_desc:
            "Design intuitive user interfaces and improve digital user experiences.",
          details: [
            "User interface design fundamentals",
            "Usability principles",
            "Prototyping tools (Adobe XD, Sketch)",
          ],
          why_choose_this_course:
            "This course is ideal for learners who want to design user-friendly and visually polished digital products.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students highlight the project-based learning and better understanding of user-centered design practices.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "3D Modeling and Animation (using Blender)",
        short_desc:
          "Create 3D models and animations using Blender from scratch.",
        details: [
          "Introduction to Blender interface",
          "Modeling techniques",
          "Animation principles",
        ],
        duration: "3 Months",
        price: "₹17,999",
        link: "https://topmate.io/seven_oz/1985008",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "3D Modeling and Animation (using Blender)",
          short_desc:
            "Create 3D models and animations using Blender from scratch.",
          details: [
            "Introduction to Blender interface",
            "Modeling techniques",
            "Animation principles",
          ],
          why_choose_this_course:
            "This course supports beginners in building 3D modeling and animation skills with step-by-step guidance.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Learners enjoy the clear Blender workflow and practical animation exercises throughout the course.",
        },
      },
    ],
  },
  {
    category: "Self Enchancment Zone",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Spoken English",
        short_desc:
          "Improve spoken English fluency, grammar, and confidence for daily use.",
        details: [
          "Speaking and pronunciation basics",
          "Grammar and sentence structure",
          "Confidence building in speaking",
        ],
        duration: "12 Months",
        price: "₹4999",
        link: "https://topmate.io/seven_oz/1985020",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Spoken English",
          short_desc:
            "Improve spoken English fluency, grammar, and confidence for daily use.",
          details: [
            "Speaking and pronunciation basics",
            "Grammar and sentence structure",
            "Confidence building in speaking",
          ],
          why_choose_this_course:
            "This course helps learners build communication confidence for academics, interviews, and daily conversations.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students value the confidence-building activities and practical speaking sessions.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Discord Management and Bot Management",
        short_desc:
          "Manage Discord communities, bots, and moderation effectively.",
        details: [
          "Managing Discord servers",
          "Creating and managing bots",
          "Server moderation and security",
        ],
        duration: "2 Months",
        price: "₹11,999",
        link: "https://topmate.io/seven_oz/1985021",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Discord Management and Bot Management",
          short_desc:
            "Manage Discord communities, bots, and moderation effectively.",
          details: [
            "Managing Discord servers",
            "Creating and managing bots",
            "Server moderation and security",
          ],
          why_choose_this_course:
            "This course is great for learners who want to manage online communities with automation and moderation best practices.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Learners report better server management skills and confidence in bot workflows.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "GitHub & GitLab",
        short_desc:
          "Learn version control workflows for team collaboration and projects.",
        details: [
          "Introduction to Git and GitHub",
          "Version control basics",
          "Collaboration workflows",
        ],
        duration: "2 Months",
        price: "₹2,999",
        link: "https://topmate.io/seven_oz/1985027",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "GitHub & GitLab",
          short_desc:
            "Learn version control workflows for team collaboration and projects.",
          details: [
            "Introduction to Git and GitHub",
            "Version control basics",
            "Collaboration workflows",
          ],
          why_choose_this_course:
            "This course is ideal for learners who want to collaborate efficiently and manage code changes professionally.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Learners mention strong improvement in collaborative workflows and Git confidence.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Photoshop : Basic to Advanced",
        short_desc:
          "Master Photoshop from basics to advanced editing and compositing.",
        details: [
          "Introduction to Photoshop",
          "Image editing and retouching",
          "Working with layers and masks",
          "Advanced photo manipulation techniques",
          "Creating digital art and composites",
        ],
        duration: "4 Months",
        price: "₹10,999",
        link: "https://topmate.io/seven_oz/1985055",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Photoshop : Basic to Advanced",
          short_desc:
            "Master Photoshop from basics to advanced editing and compositing.",
          details: [
            "Introduction to Photoshop",
            "Image editing and retouching",
            "Working with layers and masks",
            "Advanced photo manipulation techniques",
            "Creating digital art and composites",
          ],
          why_choose_this_course:
            "This course is ideal for creatives who want complete Photoshop proficiency for design and editing projects.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students love the balance of fundamentals and advanced creative editing techniques.",
        },
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        name: "Lightroom : Basic to Advanced",
        short_desc:
          "Edit and organize photos professionally with Lightroom workflows.",
        details: [
          "Introduction to Lightroom",
          "Importing and organizing photos",
          "Basic and advanced editing techniques",
        ],
        duration: "2 Months",
        price: "₹10,999",
        link: "https://topmate.io/seven_oz/1985056",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Lightroom : Basic to Advanced",
          short_desc:
            "Edit and organize photos professionally with Lightroom workflows.",
          details: [
            "Introduction to Lightroom",
            "Importing and organizing photos",
            "Basic and advanced editing techniques",
          ],
          why_choose_this_course:
            "This course is for learners who want efficient and professional photo editing workflows with Lightroom.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Learners appreciate the practical editing guidance and workflow-focused lessons.",
        },
      },
    ],
  },
];

const COURSE_FALLBACK_IMAGE = "/public/assets/images/img/thumb.png";

const COURSE_CATEGORY_META = {
  "Coding Language Course": { icon: "ri-code-s-slash-line", label: "Coding" },
  "Web Development": { icon: "ri-layout-4-line", label: "Web" },
  "Mathematical Aptitude": { icon: "ri-function-line", label: "Math" },
  "ML/AI": { icon: "ri-cpu-line", label: "AI" },
  "Design": { icon: "ri-palette-line", label: "Design" },
  "Self Enchancment Zone": { icon: "ri-rocket-line", label: "Growth" },
};

function getCourseCoverImage(course) {
  return course.coverImage || COURSE_FALLBACK_IMAGE;
}

function getCourseTitle(course) {
  return course.title || course.name || "Untitled Course";
}

function createCourseSlug(name) {
  return String(name || "course")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCourseItem(course) {
  const name = getCourseTitle(course);
  const details =
    Array.isArray(course.details) && course.details.length > 0
      ? course.details
      : ["Structured learning path designed for practical skill growth."];
  const short_desc =
    course.short_desc ||
    course.Short_desc ||
    course.shortDescription ||
    `${name}: ${details[0]}`;
  const certificationAvailabilityRaw =
    course.view_details?.certification_available ??
    course.view_details?.certificationAvailable ??
    course.certificationAvailable ??
    "n";
  const certificationAvailable =
    certificationAvailabilityRaw === true ||
    String(certificationAvailabilityRaw).toLowerCase() === "y";

  const view_details = {
    cover:
      course.view_details?.cover || course.coverImage || COURSE_FALLBACK_IMAGE,
    title: course.view_details?.title || name,
    shortDescription:
      course.view_details?.short_desc ||
      course.view_details?.shortDescription ||
      short_desc,
    details:
      Array.isArray(course.view_details?.details) &&
      course.view_details.details.length > 0
        ? course.view_details.details
        : details,
    whyChooseThisCourse:
      course.view_details?.why_choose_this_course ||
      course.view_details?.whyChooseThisCourse ||
      course.whyChooseThisCourse ||
      "Hands-on sessions, mentor guidance, and practical projects to build job-ready skills.",
    certificationAvailable,
    certificationCost:
      course.view_details?.certification_cost ||
      course.view_details?.certificationCost ||
      course.certificationCost ||
      (certificationAvailable ? "Included" : "N/A"),
    publicReview:
      course.view_details?.public_review ||
      course.view_details?.publicReview ||
      course.publicReview ||
      "Rated highly by learners for clarity, practical content, and mentorship support.",
  };

  return {
    ...course,
    name,
    short_desc,
    Short_desc: short_desc,
    details,
    duration: course.duration || "TBD",
    price: course.price || "TBD",
    link: course.link || "#",
    view_details,
  };
}

const normalizedCourses = courses.map((group) => ({
  ...group,
  items: Array.isArray(group.items) ? group.items.map(normalizeCourseItem) : [],
}));

function hashSeed(seedText) {
  return seedText.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function createCourseThumbnail(seedText, title, categoryLabel) {
  const seed = hashSeed(seedText);
  const hueA = seed % 360;
  const hueB = (seed * 1.7) % 360;
  const initials =
    title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "C";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hueA}, 85%, 55%)"/>
          <stop offset="100%" stop-color="hsl(${hueB}, 85%, 45%)"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <rect x="36" y="36" width="1128" height="603" rx="24" fill="rgba(0,0,0,0.16)"/>
      <text x="70" y="150" font-size="46" font-family="Arial, sans-serif" fill="white" opacity="0.9">${categoryLabel}</text>
      <text x="70" y="325" font-size="170" font-family="Arial, sans-serif" font-weight="700" fill="white">${initials}</text>
      <text x="70" y="530" font-size="58" font-family="Arial, sans-serif" font-weight="600" fill="white">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getUniqueCourseCoverImage(course, category, index) {
  if (course.coverImage) {
    return course.coverImage;
  }

  const title = getCourseTitle(course);
  const seedText = `${category}-${index}-${title}`;
  return createCourseThumbnail(seedText, title, category);
}

function getCourseShortDescription(course, courseTitle) {
  if (course.view_details?.shortDescription) {
    return course.view_details.shortDescription;
  }

  if (course.short_desc) {
    return course.short_desc;
  }

  if (course.Short_desc) {
    return course.Short_desc;
  }

  if (course.shortDescription) {
    return course.shortDescription;
  }

  if (Array.isArray(course.details) && course.details.length > 0) {
    return `${courseTitle}: ${course.details[0]}`;
  }

  return `${courseTitle}: Structured learning path designed for practical skill growth.`;
}

function getCourseCategoryMeta(category) {
  return (
    COURSE_CATEGORY_META[category] || {
      icon: "ri-book-open-line",
      label: "Course",
    }
  );
}

function createCourseImage(coverImage, title, badgeMeta) {
  const imageWrap = document.createElement("div");
  imageWrap.className =
    "relative w-full h-44 rounded-lg border border-black/10 overflow-hidden mb-4";

  const image = document.createElement("img");
  image.className = "w-full h-full object-cover";
  image.src = sanitizeUrl(coverImage, { allowDataImage: true, fallback: COURSE_FALLBACK_IMAGE });
  image.alt = escapeHtml(title);
  image.loading = "lazy";

  const badge = document.createElement("span");
  badge.className =
    "absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/80 text-white px-3 py-1 text-xs font-semibold";
  const icon = document.createElement("i");
  icon.className = badgeMeta.icon;
  badge.append(icon, escapeHtml(badgeMeta.label));

  imageWrap.append(image, badge);
  return imageWrap;
}

function getOrCreateCourseDetailsModal() {
  const existing = document.getElementById("courseDetailsModal");
  if (existing) {
    return existing;
  }

  const modal = document.createElement("div");
  modal.id = "courseDetailsModal";
  modal.className =
    "fixed inset-0 z-50 hidden items-center justify-center bg-black/50 px-4";

  const panel = document.createElement("div");
  panel.className =
    "w-full max-w-2xl rounded-xl border border-black/20 bg-white p-6 shadow-lg";

  const head = document.createElement("div");
  head.className = "mb-4 flex items-start justify-between gap-4";

  const title = document.createElement("h3");
  title.id = "courseModalTitle";
  title.className = "text-2xl font-bold text-gray-900";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className =
    "rounded-md border border-black/20 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-black hover:text-white transition-colors";
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  head.append(title, closeButton);

  const shortDesc = document.createElement("p");
  shortDesc.id = "courseModalShortDesc";
  shortDesc.className = "mb-4 text-sm text-gray-700";

  const detailsHeading = document.createElement("p");
  detailsHeading.className =
    "mb-2 text-sm font-semibold uppercase tracking-wide text-gray-800";
  detailsHeading.textContent = "Details";

  const detailsList = document.createElement("ul");
  detailsList.id = "courseModalDetails";
  detailsList.className = "mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700";

  const meta = document.createElement("div");
  meta.className = "mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2";

  const duration = document.createElement("p");
  duration.id = "courseModalDuration";
  duration.className =
    "rounded-md border border-black/10 bg-gray-50 px-3 py-2 text-sm text-gray-800";

  const price = document.createElement("p");
  price.id = "courseModalPrice";
  price.className =
    "rounded-md border border-black/10 bg-gray-50 px-3 py-2 text-sm text-gray-800";

  meta.append(duration, price);

  const buyNow = document.createElement("a");
  buyNow.id = "courseModalBuyNow";
  buyNow.className =
    "inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors";
  buyNow.textContent = "Buy Now";
  buyNow.target = "_blank";
  buyNow.rel = "noopener noreferrer";

  panel.append(head, shortDesc, detailsHeading, detailsList, meta, buyNow);
  modal.appendChild(panel);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openCourseDetails(course) {
  const modal = getOrCreateCourseDetailsModal();
  const modalTitle = modal.querySelector("#courseModalTitle");
  const modalShortDesc = modal.querySelector("#courseModalShortDesc");
  const modalDetails = modal.querySelector("#courseModalDetails");
  const modalDuration = modal.querySelector("#courseModalDuration");
  const modalPrice = modal.querySelector("#courseModalPrice");
  const modalBuyNow = modal.querySelector("#courseModalBuyNow");

  if (
    !modalTitle ||
    !modalShortDesc ||
    !modalDetails ||
    !modalDuration ||
    !modalPrice ||
    !modalBuyNow
  ) {
    return;
  }

  modalTitle.textContent = course.name;
  modalShortDesc.textContent = course.short_desc || course.Short_desc || "";
  modalDetails.innerHTML = "";

  course.details.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    modalDetails.appendChild(li);
  });

  modalDuration.textContent = `Duration: ${course.duration}`;
  modalPrice.textContent = `Price: ${course.price}`;
  modalBuyNow.href = sanitizeUrl(course.link || "#");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function renderCourses() {
  const container = document.getElementById("coursesContainer");

  if (!container) {
    return;
  }

  normalizedCourses.forEach((group) => {
    const section = document.createElement("section");
    section.className = "w-full flex flex-col gap-5";

    const heading = document.createElement("h2");
    heading.className = "text-3xl font-bold text-gray-800";
    heading.textContent = group.category;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 w-full";

    group.items.forEach((course) => {
      const card = document.createElement("article");
      card.className =
        "bg-white/70 backdrop-blur-sm rounded-xl border border-black/10 p-5 shadow-sm flex flex-col justify-between h-full transition-transform hover:scale-105";
      card.dataset.link = course.link;

      const badgeMeta = getCourseCategoryMeta(group.category);
      const courseTitle = getCourseTitle(course);
      const coverImage = getUniqueCourseCoverImage(
        course,
        group.category,
        grid.children.length,
      );
      const imageWrap = createCourseImage(coverImage, courseTitle, badgeMeta);

      const title = document.createElement("h3");
      title.className = "text-xl font-semibold mb-2 text-gray-900";
      title.textContent = courseTitle;

      const shortDescription = document.createElement("p");
      shortDescription.className = "text-sm text-gray-700 leading-relaxed mb-4";
      shortDescription.textContent = getCourseShortDescription(
        course,
        courseTitle,
      );

      const meta = document.createElement("div");
      meta.className =
        "sm:flex items-center sm:justify-between sm:w-full mt-2 pt-3 border-t border-black/10";
      const durationSpan = document.createElement("span");
      durationSpan.className = "inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1 text-sm font-medium text-gray-700";
      durationSpan.innerHTML = '<span class="h-2 w-2 rounded-full bg-red-500"></span>';
      durationSpan.append(`Duration: ${course.duration}`);

      const priceSpan = document.createElement("span");
      priceSpan.className = "text-lg font-bold text-gray-900";
      priceSpan.textContent = course.price;
      meta.append(durationSpan, priceSpan);

      const viewButton = document.createElement("a");
      const courseSlug = createCourseSlug(courseTitle);
      viewButton.className =
        "mt-4 inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors";
      viewButton.textContent = "View Course";
      viewButton.href = `course-details.html?course=${encodeURIComponent(courseSlug)}`;
      viewButton.setAttribute("aria-label", `View ${courseTitle}`);

      card.append(imageWrap, title, shortDescription, meta, viewButton);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCourses);
} else {
  renderCourses();
}

            const targetData = typeof courses !== 'undefined' ? courses : [];
            if(targetData) {
                outSql += "-- INSERT courses\n";
                for (const cat of targetData) {
                    if (true) {
                        for (const item of (cat.items || [])) {
                            outSql += `INSERT INTO courses (category, name, short_desc, duration, price, link, cover_image, details, extra_details) VALUES (
  ${sanitizeStr(cat.category)}, ${sanitizeStr(item.name || item.title)}, ${sanitizeStr(item.short_desc || item.shortDescription || item.description?.[0])}, ${sanitizeStr(item.duration || item.date)}, ${sanitizeStr(item.price)}, ${sanitizeStr(item.link)}, ${sanitizeStr(item.coverImage)}, ${objToJson(item.details || item.description)}, ${objToJson(item.view_details)}
);\n`;
                        }
                    } else {
                        outSql += `INSERT INTO faculty (name, topic, stars, price, link, description, cover_image, extra_details) VALUES (
  ${sanitizeStr(cat.name)}, ${sanitizeStr(cat.topic)}, ${sanitizeStr(cat.stars)}, ${sanitizeStr(cat.price)}, ${sanitizeStr(cat.link)}, ${sanitizeStr(cat.description)}, ${sanitizeStr(cat.coverImage)}, ${objToJson(cat.view_details)}
);\n`;
                    }
                }
                outSql += "\n";
            }
        })();
    
        // --- services ---
        (() => {
            

const services = [
  {
    category: "Academics and Certification",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Mock and Rock (Mock Exams)",
        description: [
          "Attempt real exam-style mock tests designed around current academic and certification patterns.",
          "Get section-wise performance breakdowns to identify weak areas, time-management gaps, and scoring trends.",
          "Receive targeted improvement strategies and revision guidance to boost confidence before final exams."
        ],
        price: "₹500 - ₹2000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Mock and Rock (Mock Exams)",
          short_desc:
            "Attempt real exam-style mock tests designed around current academic and certification patterns.",
          description: [
          "Attempt real exam-style mock tests designed around current academic and certification patterns.",
          "Get section-wise performance breakdowns to identify weak areas, time-management gaps, and scoring trends.",
          "Receive targeted improvement strategies and revision guidance to boost confidence before final exams."
        ],
          why_choose_this_course:
            "This course is ideal for students preparing for competitive exams or certifications who want to simulate the actual test environment, identify their strengths and weaknesses, and receive actionable feedback to improve their performance before the final exam.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Students consistently rate this course highly for its in-depth coverage of mock exam preparation and practical feedback.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Project Documentation",
        description: [
          "Create complete project reports with proper structure, professional language, and institution-ready formatting.",
          "Include system architecture, flowcharts, modules, and technical explanations in a clean and readable way.",
          "Get support for editing, proofreading, and final polishing before submission or presentation."
        ],
        price: "₹500 - ₹2000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Project Documentation",
          short_desc:
            "Create complete project reports with proper structure, professional language, and institution-ready formatting.",
          description: [
            "Create complete project reports with proper structure, professional language, and institution-ready formatting.",
            "Include system architecture, flowcharts, modules, and technical explanations in a clean and readable way.",
            "Get support for editing, proofreading, and final polishing before submission or presentation."
          ],
          why_choose_this_course:
            "This service is best for students and teams who want professionally structured, institution-ready documentation with clear technical presentation.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Users value the clarity, formatting quality, and polished final output that improves academic and project submissions.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Thesis Documentation",
        description: [
          "Develop end-to-end thesis documents with strong research structure, clarity, and academic tone.",
          "Apply required citation style, chapter formatting, references, and review-friendly layout standards.",
          "Prepare a polished final version suitable for departmental evaluation, viva, and archive submission."
        ],
        price: "₹2000 onwards",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Thesis Documentation",
          short_desc:
            "Develop end-to-end thesis documents with strong research structure, clarity, and academic tone.",
          description: [
            "Develop end-to-end thesis documents with strong research structure, clarity, and academic tone.",
            "Apply required citation style, chapter formatting, references, and review-friendly layout standards.",
            "Prepare a polished final version suitable for departmental evaluation, viva, and archive submission."
          ],
          why_choose_this_course:
            "This service is ideal for final-year scholars who need complete thesis support with academic compliance, readability, and submission-ready quality.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Learners highlight this service for reducing thesis stress and delivering well-structured, review-friendly final documents.",
        }
      }
    ]
  },
  {
    category: "Web Services",
    addons: [
      "Admin Panel - Rs. 12,000",
      "Custom Database - Rs. 10,000",
      "Payment Gateway - Rs. 8,000",
      "Blog / CMS - Rs. 10,000",
      "Advanced SEO - Rs. 12,000",
      "AI Chatbot - Rs. 15,000",
      "API Integration - Rs. 8,000",
      "3D UI - Rs. 25,000",
      "Analytics Dashboard - Rs. 20,000",
      "ERP Integration - Rs. 40,000"
    ],
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Developer Portfolio Website",
        description: [
          "Basic: Rs. 4,999 - 9,999.",
          "Professional: Rs. 15,000 - 30,000.",
          "Premium: Rs. 60,000 - 1,20,000.",
          "Enterprise: Rs. 1,80,000 - 3,50,000."
        ],
        price: "Rs. 4,999 - 3,50,000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Developer Portfolio Website",
          short_desc:
            "Build a modern developer portfolio website tailored to your skills, projects, and professional brand.",
          description: [
            "Basic: Rs. 4,999 - 9,999.",
            "Professional: Rs. 15,000 - 30,000.",
            "Premium: Rs. 60,000 - 1,20,000.",
            "Enterprise: Rs. 1,80,000 - 3,50,000."
          ],
          why_choose_this_course:
            "Perfect for developers who want a strong first impression with responsive design, project highlights, and recruiter-friendly presentation.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Clients appreciate the clean UI, performance, and conversion-focused portfolio structure.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "IT Executive / Corporate Portfolio",
        description: [
          "Basic: Rs. 8,000 - 15,000.",
          "Professional: Rs. 30,000 - 60,000.",
          "Premium: Rs. 1,20,000 - 2,50,000.",
          "Enterprise: Rs. 3,00,000 - 6,00,000."
        ],
        price: "Rs. 8,000 - 6,00,000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "IT Executive / Corporate Portfolio",
          short_desc:
            "Create a premium corporate portfolio website with polished branding and stakeholder-focused messaging.",
          description: [
            "Basic: Rs. 8,000 - 15,000.",
            "Professional: Rs. 30,000 - 60,000.",
            "Premium: Rs. 1,20,000 - 2,50,000.",
            "Enterprise: Rs. 3,00,000 - 6,00,000."
          ],
          why_choose_this_course:
            "Best suited for professionals and executives who need a premium digital presence that reflects authority and credibility.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Business users rate this service highly for brand consistency, professional look, and communication clarity.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Ecommerce Development",
        description: [
          "Basic: Rs. 20,000 - 40,000.",
          "Advanced: Rs. 80,000 - 1,50,000.",
          "Premium: Rs. 2,50,000 - 6,00,000.",
          "Enterprise: Rs. 8,00,000 - 25,00,000."
        ],
        price: "Rs. 20,000 - 25,00,000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Ecommerce Development",
          short_desc:
            "Launch an end-to-end ecommerce platform with scalable architecture, optimized checkout, and growth-ready features.",
          description: [
            "Basic: Rs. 20,000 - 40,000.",
            "Advanced: Rs. 80,000 - 1,50,000.",
            "Premium: Rs. 2,50,000 - 6,00,000.",
            "Enterprise: Rs. 8,00,000 - 25,00,000."
          ],
          why_choose_this_course:
            "Ideal for businesses planning reliable online sales with secure payment flow, catalog scalability, and conversion-focused UX.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Store owners praise this service for robust execution, smooth user journey, and measurable business outcomes.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "LMS Platform Development",
        description: [
          "Basic: Rs. 40,000 - 75,000.",
          "Advanced: Rs. 1,50,000 - 3,00,000.",
          "Premium: Rs. 5,00,000 - 12,00,000.",
          "Enterprise: Rs. 15,00,000 - 50,00,000."
        ],
        price: "Rs. 40,000 - 50,00,000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "LMS Platform Development",
          short_desc:
            "Build a complete learning management platform with course delivery, user roles, tracking, and assessment workflows.",
          description: [
            "Basic: Rs. 40,000 - 75,000.",
            "Advanced: Rs. 1,50,000 - 3,00,000.",
            "Premium: Rs. 5,00,000 - 12,00,000.",
            "Enterprise: Rs. 15,00,000 - 50,00,000."
          ],
          why_choose_this_course:
            "Recommended for educators and organizations that need a flexible, scalable LMS with strong learner and admin experiences.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Institutes report improved learner engagement and smoother content operations after deployment.",
        }
      }
    ]
  },
  {
    category: "Public Commercial",
    items: [
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Custom Desktop Design",
        description: [
          "Design a personalized desktop setup with custom themes, widgets, icons, and wallpaper styling.",
          "Optimize layout, color harmony, and visual hierarchy for both aesthetics and daily usability.",
          "Get a complete look-and-feel package aligned with your workflow, personality, and device setup."
        ],
        price: "₹2000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Custom Desktop Design",
          short_desc:
            "Design a personalized desktop setup with custom themes, widgets, icons, and wallpaper styling.",
          description: [
            "Design a personalized desktop setup with custom themes, widgets, icons, and wallpaper styling.",
            "Optimize layout, color harmony, and visual hierarchy for both aesthetics and daily usability.",
            "Get a complete look-and-feel package aligned with your workflow, personality, and device setup."
          ],
          why_choose_this_course:
            "Great for creators and professionals who want a premium desktop experience optimized for both appearance and productivity.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Users love the personalized styling and noticeable improvement in their day-to-day visual workflow.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Poster and Related Design",
        description: [
          "Create eye-catching poster concepts tailored for events, campaigns, launches, and promotions.",
          "Balance typography, visual assets, and messaging for high impact in print and digital formats.",
          "Deliver ready-to-use design outputs optimized for social media, banners, and physical prints."
        ],
        price: "₹500 - ₹1000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Poster and Related Design",
          short_desc:
            "Create eye-catching poster concepts tailored for events, campaigns, launches, and promotions.",
          description: [
            "Create eye-catching poster concepts tailored for events, campaigns, launches, and promotions.",
            "Balance typography, visual assets, and messaging for high impact in print and digital formats.",
            "Deliver ready-to-use design outputs optimized for social media, banners, and physical prints."
          ],
          why_choose_this_course:
            "Ideal for brands and event teams looking for fast, high-impact visuals that communicate clearly across channels.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Clients consistently mention strong visual appeal, timely delivery, and platform-ready outputs.",
        }
      },
      {
        coverImage: "public/assets/images/img/thumb.png",
        title: "Album Design",
        description: [
          "Build premium album layouts with consistent visual storytelling, pacing, and aesthetic continuity.",
          "Arrange photos, titles, and decorative elements using balanced composition and clean typography.",
          "Produce print-ready and digital-ready album files with polished finishing and professional quality."
        ],
        price: "₹2000 - ₹5000",
        link: "contact.html",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Album Design",
          short_desc:
            "Build premium album layouts with consistent visual storytelling, pacing, and aesthetic continuity.",
          description: [
            "Build premium album layouts with consistent visual storytelling, pacing, and aesthetic continuity.",
            "Arrange photos, titles, and decorative elements using balanced composition and clean typography.",
            "Produce print-ready and digital-ready album files with polished finishing and professional quality."
          ],
          why_choose_this_course:
            "Perfect for clients who want elegant storytelling-oriented album layouts for personal, brand, or event collections.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "Customers praise the premium composition style and polished final presentation in both print and digital formats.",
        }
      }
    ]
  }
];

const SERVICE_FALLBACK_IMAGE = "/public/assets/images/img/thumb.png";

const SERVICE_CATEGORY_META = {
  "Academics and Certification": { icon: "ri-graduation-cap-line", label: "Academic" },
  "Web Services": { icon: "ri-global-line", label: "Web" },
  "Public Commercial": { icon: "ri-store-2-line", label: "Commercial" }
};

function getServiceTitle(service) {
  return service.title || service.name || "Untitled Service";
}

function normalizeServiceItem(service) {
  const title = getServiceTitle(service);
  const shortDescription =
    service.shortDescription ||
    service.short_desc ||
    service.Short_desc ||
    (Array.isArray(service.description) && service.description.length > 0
      ? service.description[0]
      : "Tailored service designed for practical and measurable outcomes.");

  return {
    ...service,
    title,
    shortDescription,
    price: service.price || "TBD",
    link: service.link || "#",
  };
}

const normalizedServices = services.map((group) => ({
  ...group,
  items: Array.isArray(group.items)
    ? group.items.map(normalizeServiceItem)
    : [],
}));

function hashSeed(seedText) {
  return seedText.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function createServiceThumbnail(seedText, title, categoryLabel) {
  const seed = hashSeed(seedText);
  const hueA = seed % 360;
  const hueB = (seed * 1.8) % 360;
  const initials =
    title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "S";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hueA}, 85%, 55%)"/>
          <stop offset="100%" stop-color="hsl(${hueB}, 85%, 45%)"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <rect x="36" y="36" width="1128" height="603" rx="24" fill="rgba(0,0,0,0.16)"/>
      <text x="70" y="150" font-size="46" font-family="Arial, sans-serif" fill="white" opacity="0.9">${escapeHtml(categoryLabel)}</text>
      <text x="70" y="325" font-size="170" font-family="Arial, sans-serif" font-weight="700" fill="white">${escapeHtml(initials)}</text>
      <text x="70" y="530" font-size="58" font-family="Arial, sans-serif" font-weight="600" fill="white">${escapeHtml(title)}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getUniqueServiceCoverImage(service, category, index) {
  if (service.thumbnail || service.coverImage) {
    return service.thumbnail || service.coverImage;
  }

  const title = getServiceTitle(service);
  const seedText = `${category}-${index}-${title}`;
  return createServiceThumbnail(seedText, title, category);
}

function getServiceShortDescription(service) {
  if (service.shortDescription) {
    return service.shortDescription;
  }

  if (Array.isArray(service.description) && service.description.length > 0) {
    return service.description[0];
  }

  return "Tailored service designed for practical and measurable outcomes.";
}

function getServiceCategoryMeta(category) {
  return SERVICE_CATEGORY_META[category] || { icon: "ri-service-line", label: "Service" };
}

function createServiceSlug(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createServiceImage(coverImage, title, badgeMeta) {
  const imageWrap = document.createElement("div");
  imageWrap.className = "relative w-full h-44 rounded-lg border border-black/10 overflow-hidden mb-4";

  const image = document.createElement("img");
  image.className = "w-full h-full object-cover";
  image.src = sanitizeUrl(coverImage, { allowDataImage: true, fallback: SERVICE_FALLBACK_IMAGE });
  image.alt = escapeHtml(title);
  image.loading = "lazy";

  const badge = document.createElement("span");
  badge.className = "absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/80 text-white px-3 py-1 text-xs font-semibold";
  const icon = document.createElement("i");
  icon.className = badgeMeta.icon;
  badge.append(icon, escapeHtml(badgeMeta.label));

  imageWrap.append(image, badge);
  return imageWrap;
}

function createAddonsMarkup(addons) {
  return addons
    .map(
      (addon) => `<label class="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" name="Add-ons[]" value="${escapeHtml(addon)}" class="mt-1"><span>${escapeHtml(addon)}</span></label>`
    )
    .join("");
}

function injectWebServiceForm(target, addons) {
  target.innerHTML = `
    <div class="w-full bg-white/70 backdrop-blur-sm rounded-xl border border-black/10 p-5 shadow-sm flex flex-col gap-4 mt-6">
      <h3 class="text-2xl font-bold text-gray-900">Order Web Service</h3>
      <p class="text-sm text-gray-700">Submit this form to place your order directly via email.</p>
      <form class="grid grid-cols-1 md:grid-cols-2 gap-4" action="https://formsubmit.co/orders.seveninst@gmail.com" method="post" autocomplete="off">
        <input type="hidden" name="_template" value="table">
        <input type="text" name="Full Name" required placeholder="Full Name" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="email" name="Email" required placeholder="Email Address" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="tel" name="Phone" required placeholder="Phone Number" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <select name="Service Type" required class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <option value="" disabled selected>Select Web Service</option>
          <option value="Developer Portfolio Website">Developer Portfolio Website</option>
          <option value="IT Executive / Corporate Portfolio">IT Executive / Corporate Portfolio</option>
          <option value="Ecommerce Development">Ecommerce Development</option>
          <option value="LMS Platform Development">LMS Platform Development</option>
        </select>
        <select name="Preferred Tier" required class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <option value="Basic">Basic</option>
          <option value="Professional">Professional</option>
          <option value="Advanced">Advanced</option>
          <option value="Dynamic">Dynamic</option>
          <option value="Premium">Premium</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <input type="text" name="Budget Range" placeholder="Budget Range (e.g. Rs. 80,000 - 1,50,000)" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="text" name="Expected Timeline" placeholder="Expected Timeline (e.g. 4-6 weeks)" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">

        <div class="md:col-span-2 rounded-lg border border-black/15 p-3 bg-white">
          <p class="text-sm font-semibold text-gray-900 mb-2">Select Add-ons</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${createAddonsMarkup(addons)}
          </div>
        </div>

        <textarea name="Project Requirements" rows="4" placeholder="Describe your project requirements" class="md:col-span-2 rounded-lg border border-black/20 px-4 py-2 text-sm bg-white"></textarea>
        <button type="submit" class="md:col-span-2 inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors">Place Order</button>
      </form>
    </div>
  `;
}

function injectAcademicsServiceForm(target, items) {
  const serviceOptions = items
    .map((service) => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`)
    .join("");

  target.innerHTML = `
    <div class="w-full bg-white/70 backdrop-blur-sm rounded-xl border border-black/10 p-5 shadow-sm flex flex-col gap-4 mt-6">
      <h3 class="text-2xl font-bold text-gray-900">Academics & Certification Request</h3>
      <p class="text-sm text-gray-700">Select a service to view the right options and estimated pricing.</p>

      <form id="academicsServiceForm" class="grid grid-cols-1 md:grid-cols-2 gap-4" action="https://formsubmit.co/orders.seveninst@gmail.com" method="post" autocomplete="off">
        <input type="hidden" name="_template" value="table">
        <input type="text" name="Full Name" required placeholder="Full Name" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="email" name="Email" required placeholder="Email Address" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="tel" name="Phone" required placeholder="Phone Number" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">

        <select id="academicServiceType" name="Service Type" required class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <option value="" disabled selected>Select Service</option>
          ${serviceOptions}
        </select>

        <div id="mockRockFields" class="hidden md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-black/15 p-3 bg-white">
          <select id="mockTestCount" name="Mock Tests" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
            <option value="1">1 Mock Test</option>
            <option value="2">2 Mock Tests</option>
            <option value="3">3 Mock Tests</option>
            <option value="4">4 Mock Tests</option>
          </select>
          <input id="subjectCount" type="number" min="1" name="Number of Subjects" placeholder="Number of Subjects" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <p class="md:col-span-2 text-xs text-gray-600">Pricing: ₹500 per test per subject. Max 4 tests at a time.</p>
        </div>

        <div id="projectDocFields" class="hidden md:col-span-2 rounded-lg border border-black/15 p-3 bg-white">
          <select id="projectDocType" name="Project Documentation Type" class="w-full rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
            <option value="">Select Documentation Type</option>
            <option value="Word Document" data-price="500">Word Document - ₹500</option>
            <option value="LaTeX Documentation" data-price="1000">LaTeX Documentation - ₹1000</option>
            <option value="Customized Publisher Based Documentation" data-price="2000">Customized Publisher Based Documentation - ₹2000</option>
          </select>
        </div>

        <div id="thesisFields" class="hidden md:col-span-2 rounded-lg border border-black/15 p-3 bg-white">
          <select id="thesisPageRange" name="Thesis Page Range" class="w-full rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
            <option value="">Select Page Range (LaTeX only)</option>
            <option value="4-7 pages" data-price="2000">4-7 pages - ₹2000</option>
            <option value="8-20 pages" data-price="5000">8-20 pages - ₹5000</option>
            <option value="20-40 pages" data-price="8000">20-40 pages - ₹8000</option>
            <option value="40+ pages" data-price="discussion">40 onwards - Discussion Required</option>
          </select>
        </div>

        <div class="md:col-span-2 rounded-lg border border-black/15 p-3 bg-white flex flex-col gap-2">
          <p class="text-sm font-semibold text-gray-900">Estimated Price</p>
          <p id="academicsEstimatedPrice" class="text-lg font-bold text-gray-900">Select a service to calculate price</p>
          <input id="estimatedPriceInput" type="hidden" name="Estimated Price" value="Not selected">
          <input id="selectedActionLink" type="hidden" name="Service Action Link" value="#">
        </div>

        <textarea name="Requirements" rows="4" placeholder="Add details about your requirement" class="md:col-span-2 rounded-lg border border-black/20 px-4 py-2 text-sm bg-white"></textarea>

        <a id="academicsBookSession" href="contact.html" target="_blank" rel="noopener noreferrer" class="md:col-span-2 inline-flex items-center justify-center rounded-lg border border-black/20 bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-white hover:text-black transition-colors">Book Session</a>
        <button type="submit" class="md:col-span-2 inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors">Submit Request</button>
      </form>
    </div>
  `;

  const form = target.querySelector("#academicsServiceForm");
  if (!form) {
    return;
  }

  const serviceType = form.querySelector("#academicServiceType");
  const mockRockFields = form.querySelector("#mockRockFields");
  const projectDocFields = form.querySelector("#projectDocFields");
  const thesisFields = form.querySelector("#thesisFields");
  const mockTestCount = form.querySelector("#mockTestCount");
  const subjectCount = form.querySelector("#subjectCount");
  const projectDocType = form.querySelector("#projectDocType");
  const thesisPageRange = form.querySelector("#thesisPageRange");
  const estimatedPriceLabel = form.querySelector("#academicsEstimatedPrice");
  const estimatedPriceInput = form.querySelector("#estimatedPriceInput");
  const actionLinkInput = form.querySelector("#selectedActionLink");
  const bookSessionButton = form.querySelector("#academicsBookSession");

  const linkByTitle = items.reduce((acc, service) => {
    acc[service.title] = service.link || "#";
    return acc;
  }, {});

  function hideAllConditionBlocks() {
    mockRockFields.classList.add("hidden");
    projectDocFields.classList.add("hidden");
    thesisFields.classList.add("hidden");

    subjectCount.required = false;
    projectDocType.required = false;
    thesisPageRange.required = false;
  }

  function setEstimatedPrice(priceText) {
    estimatedPriceLabel.textContent = priceText;
    estimatedPriceInput.value = priceText;
  }

  function updateBookingLink(selectedTitle) {
    const safeLink = sanitizeUrl("contact.html");
    bookSessionButton.href = safeLink;
    actionLinkInput.value = safeLink;
  }

  function recalculatePrice() {
    const selectedTitle = serviceType.value;

    if (!selectedTitle) {
      setEstimatedPrice("Select a service to calculate price");
      updateBookingLink("");
      return;
    }

    if (selectedTitle === "Mock and Rock (Mock Exams)") {
      const tests = Math.min(4, Math.max(1, Number(mockTestCount.value) || 1));
      const subjects = Math.max(1, Number(subjectCount.value) || 1);
      const total = tests * subjects * 500;
      setEstimatedPrice(`₹${total} (${tests} test(s) × ${subjects} subject(s) × ₹500)`);
      return;
    }

    if (selectedTitle === "Project Documentation") {
      const selectedOption = projectDocType.options[projectDocType.selectedIndex];
      const price = selectedOption?.dataset?.price;
      if (!price) {
        setEstimatedPrice("Select documentation type to calculate price");
        return;
      }

      setEstimatedPrice(`₹${Number(price)}`);
      return;
    }

    if (selectedTitle === "Thesis Documentation") {
      const selectedOption = thesisPageRange.options[thesisPageRange.selectedIndex];
      const price = selectedOption?.dataset?.price;

      if (!price) {
        setEstimatedPrice("Select thesis page range to calculate price");
        return;
      }

      if (price === "discussion") {
        setEstimatedPrice("Discussion Required (40+ pages)");
        return;
      }

      setEstimatedPrice(`₹${Number(price)}`);
    }
  }

  function handleServiceTypeChange() {
    const selectedTitle = serviceType.value;
    hideAllConditionBlocks();
    updateBookingLink(selectedTitle);

    if (selectedTitle === "Mock and Rock (Mock Exams)") {
      mockRockFields.classList.remove("hidden");
      subjectCount.required = true;
    } else if (selectedTitle === "Project Documentation") {
      projectDocFields.classList.remove("hidden");
      projectDocType.required = true;
    } else if (selectedTitle === "Thesis Documentation") {
      thesisFields.classList.remove("hidden");
      thesisPageRange.required = true;
    }

    recalculatePrice();
  }

  serviceType.addEventListener("change", handleServiceTypeChange);
  mockTestCount.addEventListener("change", recalculatePrice);
  subjectCount.addEventListener("input", recalculatePrice);
  projectDocType.addEventListener("change", recalculatePrice);
  thesisPageRange.addEventListener("change", recalculatePrice);

  hideAllConditionBlocks();
  setEstimatedPrice("Select a service to calculate price");
  updateBookingLink("");
}

function injectPublicCommercialForm(target, items) {
  const serviceOptions = items
    .map((service) => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`)
    .join("");

  target.innerHTML = `
    <div class="w-full bg-white/70 backdrop-blur-sm rounded-xl border border-black/10 p-5 shadow-sm flex flex-col gap-4 mt-6">
      <h3 class="text-2xl font-bold text-gray-900">Public Commercial Request</h3>
      <p class="text-sm text-gray-700">Choose a service to get the right options and estimated pricing.</p>

      <form id="publicCommercialForm" class="grid grid-cols-1 md:grid-cols-2 gap-4" action="https://formsubmit.co/orders.seveninst@gmail.com" method="post" autocomplete="off">
        <input type="hidden" name="_template" value="table">
        <input type="text" name="Full Name" required placeholder="Full Name" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="email" name="Email" required placeholder="Email Address" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
        <input type="tel" name="Phone" required placeholder="Phone Number" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">

        <select id="publicServiceType" name="Service Type" required class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <option value="" disabled selected>Select Public Commercial Service</option>
          ${serviceOptions}
        </select>

        <div id="desktopFields" class="hidden md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-black/15 p-3 bg-white">
          <input id="desktopCount" type="number" min="1" value="1" name="Desktop Setups" placeholder="Number of Desktop Setups" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <input type="text" name="Desktop Preference" placeholder="Theme / Style Preference" class="rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
          <p class="md:col-span-2 text-xs text-gray-600">Pricing: ₹2000 per desktop setup.</p>
        </div>

        <div id="posterFields" class="hidden md:col-span-2 rounded-lg border border-black/15 p-3 bg-white">
          <select id="posterPackage" name="Poster Package" class="w-full rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
            <option value="">Select Poster Package</option>
            <option value="Standard" data-price="500">Standard - ₹500</option>
            <option value="Premium" data-price="1000">Premium - ₹1000</option>
          </select>
        </div>

        <div id="albumFields" class="hidden md:col-span-2 rounded-lg border border-black/15 p-3 bg-white">
          <select id="albumPackage" name="Album Package" class="w-full rounded-lg border border-black/20 px-4 py-2 text-sm bg-white">
            <option value="">Select Album Package</option>
            <option value="Standard" data-price="2000">Standard - ₹2000</option>
            <option value="Premium" data-price="5000">Premium - ₹5000</option>
          </select>
        </div>

        <div class="md:col-span-2 rounded-lg border border-black/15 p-3 bg-white flex flex-col gap-2">
          <p class="text-sm font-semibold text-gray-900">Estimated Price</p>
          <p id="publicEstimatedPrice" class="text-lg font-bold text-gray-900">Select a service to calculate price</p>
          <input id="publicEstimatedPriceInput" type="hidden" name="Estimated Price" value="Not selected">
          <input id="publicActionLink" type="hidden" name="Service Action Link" value="contact.html">
        </div>

        <textarea name="Requirements" rows="4" placeholder="Add details about your requirement" class="md:col-span-2 rounded-lg border border-black/20 px-4 py-2 text-sm bg-white"></textarea>

        <a id="publicBookSession" href="contact.html" target="_blank" rel="noopener noreferrer" class="md:col-span-2 inline-flex items-center justify-center rounded-lg border border-black/20 bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-white hover:text-black transition-colors">Book Session</a>
        <button type="submit" class="md:col-span-2 inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors">Submit Request</button>
      </form>
    </div>
  `;

  const form = target.querySelector("#publicCommercialForm");
  if (!form) {
    return;
  }

  const serviceType = form.querySelector("#publicServiceType");
  const desktopFields = form.querySelector("#desktopFields");
  const posterFields = form.querySelector("#posterFields");
  const albumFields = form.querySelector("#albumFields");
  const desktopCount = form.querySelector("#desktopCount");
  const posterPackage = form.querySelector("#posterPackage");
  const albumPackage = form.querySelector("#albumPackage");
  const estimatedPriceLabel = form.querySelector("#publicEstimatedPrice");
  const estimatedPriceInput = form.querySelector("#publicEstimatedPriceInput");
  const actionLinkInput = form.querySelector("#publicActionLink");
  const bookSessionButton = form.querySelector("#publicBookSession");

  function hideAllConditionBlocks() {
    desktopFields.classList.add("hidden");
    posterFields.classList.add("hidden");
    albumFields.classList.add("hidden");

    desktopCount.required = false;
    posterPackage.required = false;
    albumPackage.required = false;
  }

  function setEstimatedPrice(priceText) {
    estimatedPriceLabel.textContent = priceText;
    estimatedPriceInput.value = priceText;
  }

  function updateBookingLink() {
    const safeLink = sanitizeUrl("contact.html");
    bookSessionButton.href = safeLink;
    actionLinkInput.value = safeLink;
  }

  function recalculatePrice() {
    const selectedTitle = serviceType.value;

    if (!selectedTitle) {
      setEstimatedPrice("Select a service to calculate price");
      updateBookingLink();
      return;
    }

    if (selectedTitle === "Custom Desktop Design") {
      const count = Math.max(1, Number(desktopCount.value) || 1);
      const total = count * 2000;
      setEstimatedPrice(`₹${total} (${count} setup(s) × ₹2000)`);
      return;
    }

    if (selectedTitle === "Poster and Related Design") {
      const selectedOption = posterPackage.options[posterPackage.selectedIndex];
      const price = selectedOption?.dataset?.price;

      if (!price) {
        setEstimatedPrice("Select poster package to calculate price");
        return;
      }

      setEstimatedPrice(`₹${Number(price)}`);
      return;
    }

    if (selectedTitle === "Album Design") {
      const selectedOption = albumPackage.options[albumPackage.selectedIndex];
      const price = selectedOption?.dataset?.price;

      if (!price) {
        setEstimatedPrice("Select album package to calculate price");
        return;
      }

      setEstimatedPrice(`₹${Number(price)}`);
    }
  }

  function handleServiceTypeChange() {
    const selectedTitle = serviceType.value;
    hideAllConditionBlocks();
    updateBookingLink();

    if (selectedTitle === "Custom Desktop Design") {
      desktopFields.classList.remove("hidden");
      desktopCount.required = true;
    } else if (selectedTitle === "Poster and Related Design") {
      posterFields.classList.remove("hidden");
      posterPackage.required = true;
    } else if (selectedTitle === "Album Design") {
      albumFields.classList.remove("hidden");
      albumPackage.required = true;
    }

    recalculatePrice();
  }

  serviceType.addEventListener("change", handleServiceTypeChange);
  desktopCount.addEventListener("input", recalculatePrice);
  posterPackage.addEventListener("change", recalculatePrice);
  albumPackage.addEventListener("change", recalculatePrice);

  hideAllConditionBlocks();
  setEstimatedPrice("Select a service to calculate price");
  updateBookingLink();
}

function renderServices() {
  const container = document.getElementById("servicesContainer");

  if (!container) {
    return;
  }

  normalizedServices.forEach((group) => {
    const section = document.createElement("section");
    section.className = "w-full flex flex-col gap-5";

    const heading = document.createElement("h2");
    heading.className = "text-3xl font-bold text-gray-800";
    heading.textContent = group.category;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 w-full";

    group.items.forEach((service, index) => {
      const card = document.createElement("article");
      card.className = "bg-white/70 backdrop-blur-sm rounded-xl border border-black/10 p-5 shadow-sm flex flex-col justify-between h-full transition-transform hover:scale-105";
      card.dataset.link = service.link;

      const badgeMeta = getServiceCategoryMeta(group.category);
      const imageWrap = createServiceImage(
        getUniqueServiceCoverImage(service, group.category, index) ||
          SERVICE_FALLBACK_IMAGE,
        service.title,
        badgeMeta,
      );

      const title = document.createElement("h3");
      title.className = "text-xl font-semibold mb-2 text-gray-900";
      title.textContent = service.title;

      const shortDescription = document.createElement("p");
      shortDescription.className = "text-sm text-gray-700 leading-relaxed mb-4";
      shortDescription.textContent = getServiceShortDescription(service);

      const meta = document.createElement("div");
      meta.className = "flex items-center justify-between mt-2 pt-3 border-t border-black/10";
      const priceSpan = document.createElement("span");
      priceSpan.className = "text-lg font-bold text-gray-900";
      priceSpan.textContent = service.price;
      meta.appendChild(priceSpan);

      const actions = document.createElement("div");
      actions.className = "mt-4";

      const serviceSlug = createServiceSlug(service.title);

      const viewButton = document.createElement("a");
      viewButton.href = `service-details.html?service=${encodeURIComponent(serviceSlug)}`;
      viewButton.className = "inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors w-full";
      viewButton.textContent = "View Service";
      viewButton.setAttribute("aria-label", `View ${service.title}`);

      actions.append(viewButton);
      card.append(imageWrap, title, shortDescription, meta, actions);
      grid.appendChild(card);
    });

    section.appendChild(grid);

    if (group.category === "Web Services") {
      const formContainer = document.createElement("div");
      formContainer.id = "webServiceFormWrapper";
      section.appendChild(formContainer);
      injectWebServiceForm(formContainer, group.addons || []);
    }

    if (group.category === "Academics and Certification") {
      const formContainer = document.createElement("div");
      formContainer.id = "academicsServiceFormWrapper";
      section.appendChild(formContainer);
      injectAcademicsServiceForm(formContainer, group.items || []);
    }

    if (group.category === "Public Commercial") {
      const formContainer = document.createElement("div");
      formContainer.id = "publicCommercialFormWrapper";
      section.appendChild(formContainer);
      injectPublicCommercialForm(formContainer, group.items || []);
    }

    container.appendChild(section);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderServices);
} else {
  renderServices();
}



            const targetData = typeof services !== 'undefined' ? services : [];
            if(targetData) {
                outSql += "-- INSERT services\n";
                for (const cat of targetData) {
                    if (true) {
                        for (const item of (cat.items || [])) {
                            outSql += `INSERT INTO services (category, name, short_desc, duration, price, link, cover_image, details, extra_details) VALUES (
  ${sanitizeStr(cat.category)}, ${sanitizeStr(item.name || item.title)}, ${sanitizeStr(item.short_desc || item.shortDescription || item.description?.[0])}, ${sanitizeStr(item.duration || item.date)}, ${sanitizeStr(item.price)}, ${sanitizeStr(item.link)}, ${sanitizeStr(item.coverImage)}, ${objToJson(item.details || item.description)}, ${objToJson(item.view_details)}
);\n`;
                        }
                    } else {
                        outSql += `INSERT INTO faculty (name, topic, stars, price, link, description, cover_image, extra_details) VALUES (
  ${sanitizeStr(cat.name)}, ${sanitizeStr(cat.topic)}, ${sanitizeStr(cat.stars)}, ${sanitizeStr(cat.price)}, ${sanitizeStr(cat.link)}, ${sanitizeStr(cat.description)}, ${sanitizeStr(cat.coverImage)}, ${objToJson(cat.view_details)}
);\n`;
                    }
                }
                outSql += "\n";
            }
        })();
    
        // --- notes ---
        (() => {
            

const notes = [
  {
    category: "Coding Language notes",
    items: [
      {
        title: "Python CheatSheet",
        thumbnail: "https://memgraph.com/images/blog/in-memory-databases-that-work-great-with-python/cover.png",
        shortDescription: "Quick reference guide for Python syntax, built-ins, and practical coding patterns.",
        type: "Coding Language notes",
        price: "₹1,999",
        link: "#topmate#Link",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Python CheatSheet",
          short_desc:
            "Quick reference guide for Python syntax, built-ins, and practical coding patterns.",
          description: [
          "Quick reference guide for Python syntax, built-ins, and practical coding patterns.",
          "Covers essential concepts like data structures, control flow, functions, and modules.",
          "Receive targeted improvement strategies and revision guidance to boost confidence before final exams."
        ],
          why_choose_this_course:
            "Ideal for students seeking a concise, exam-focused resource to quickly review key Python concepts and coding patterns before their final exams.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "This Python CheatSheet was a lifesaver during my exam prep! It condensed all the essential syntax and coding patterns into one easy-to-use guide. The targeted improvement strategies helped me focus on my weak areas, and I felt much more confident going into the exam. Highly recommend for any student looking for a quick review resource!",
        }
      },
      {
        title: "Regression Analysis Notes",
        thumbnail: "/public/assets/images/img/thumb.png",
        shortDescription: "Compact notes on core regression concepts, assumptions, metrics, and interpretation.",
        type: "Statistics Notes",
        price: "₹2,999",
        link: "#topmate#Link",
        view_details: {
          cover: "public/assets/images/img/thumb.png",
          title: "Regression Analysis Notes",
          short_desc:
            "Compact notes on core regression concepts, assumptions, metrics, and interpretation.",
          description: [
          "Compact notes on core regression concepts, assumptions, metrics, and interpretation.",
          "Covers essential concepts like linear regression, logistic regression, and model evaluation.",
          "Receive targeted improvement strategies and revision guidance to boost confidence before final exams."
        ],
          why_choose_this_course:
            "Ideal for students seeking a concise, exam-focused resource to quickly review key regression analysis concepts before their final exams.",
          certification_available: false,
          certification_cost: "N/A",
          public_review:
            "These Regression Analysis Notes were incredibly helpful during my exam prep! The concise format made it easy to review all the key concepts quickly. The targeted improvement strategies helped me identify my weak areas and focus my revision efforts more effectively. Highly recommend!",
        }
      },
    ]
  }
];

const NOTES_FALLBACK_IMAGE = "/public/assets/images/img/thumb.png";

function getNoteTitle(note) {
  return note.title || note.name || "Untitled Note";
}

function getNoteType(note, fallbackCategory = "Notes") {
  return note.type || fallbackCategory || "Notes";
}

function normalizeNoteItem(note) {
  const title = getNoteTitle(note);
  const shortDescription =
    note.shortDescription ||
    note.short_desc ||
    note.Short_desc ||
    "Concise, exam-focused notes designed for faster revision.";

  return {
    ...note,
    title,
    type: getNoteType(note),
    shortDescription,
    price: note.price || "TBD",
    link: note.link || "#",
  };
}

const normalizedNotes = notes.map((group) => ({
  ...group,
  items: Array.isArray(group.items) ? group.items.map(normalizeNoteItem) : [],
}));

function buildNotesByType(groups) {
  const groupedByType = new Map();

  groups.forEach((group) => {
    group.items.forEach((note) => {
      const noteType = getNoteType(note, group.category);

      if (!groupedByType.has(noteType)) {
        groupedByType.set(noteType, {
          category: noteType,
          items: [],
        });
      }

      groupedByType.get(noteType).items.push(note);
    });
  });

  return Array.from(groupedByType.values());
}

const notesByType = buildNotesByType(normalizedNotes);

function hashSeed(seedText) {
  return seedText.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function createNoteThumbnail(seedText, title, categoryLabel) {
  const seed = hashSeed(seedText);
  const hueA = seed % 360;
  const hueB = (seed * 1.8) % 360;
  const initials =
    title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "N";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hueA}, 85%, 55%)"/>
          <stop offset="100%" stop-color="hsl(${hueB}, 85%, 45%)"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <rect x="36" y="36" width="1128" height="603" rx="24" fill="rgba(0,0,0,0.16)"/>
      <text x="70" y="150" font-size="46" font-family="Arial, sans-serif" fill="white" opacity="0.9">${categoryLabel}</text>
      <text x="70" y="325" font-size="170" font-family="Arial, sans-serif" font-weight="700" fill="white">${initials}</text>
      <text x="70" y="530" font-size="58" font-family="Arial, sans-serif" font-weight="600" fill="white">${title}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getUniqueNoteCoverImage(note, category, index) {
  if (note.thumbnail || note.coverImage) {
    return note.thumbnail || note.coverImage;
  }

  const title = getNoteTitle(note);
  const seedText = `${category}-${index}-${title}`;
  return createNoteThumbnail(seedText, title, category);
}

function getNoteShortDescription(note) {
  if (note.shortDescription) {
    return note.shortDescription;
  }

  return "Concise, exam-focused notes designed for faster revision.";
}

function getNotesCategoryMeta(category) {
  const normalizedCategory = String(category || "").toLowerCase();

  if (normalizedCategory.includes("stat")) {
    return { icon: "ri-bar-chart-line", label: category || "Notes" };
  }

  if (normalizedCategory.includes("code") || normalizedCategory.includes("language")) {
    return { icon: "ri-book-open-line", label: category || "Notes" };
  }

  return {
    icon: "ri-sticky-note-line",
    label: category || "Notes",
  };
}

function createNoteSlug(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createNoteImage(coverImage, title, badgeMeta) {
  const imageWrap = document.createElement("div");
  imageWrap.className = "relative w-full h-44 rounded-lg border border-black/10 overflow-hidden mb-4";

  const image = document.createElement("img");
  image.className = "w-full h-full object-cover";
  image.src = sanitizeUrl(coverImage, { allowDataImage: true, fallback: NOTES_FALLBACK_IMAGE });
  image.alt = escapeHtml(title);
  image.loading = "lazy";

  const badge = document.createElement("span");
  badge.className = "absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/80 text-white px-3 py-1 text-xs font-semibold";
  const icon = document.createElement("i");
  icon.className = badgeMeta.icon;
  badge.append(icon, escapeHtml(badgeMeta.label));

  imageWrap.append(image, badge);
  return imageWrap;
}

function renderNotes() {
  const container = document.getElementById("notesContainer");

  if (!container) {
    return;
  }

  notesByType.forEach((group) => {
    const section = document.createElement("section");
    section.className = "w-full flex flex-col gap-5";

    const heading = document.createElement("h2");
    heading.className = "text-3xl font-bold text-gray-800";
    heading.textContent = group.category;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 w-full";

    group.items.forEach((note, index) => {
      const card = document.createElement("article");
      card.className = "bg-white/70 backdrop-blur-sm rounded-xl border border-black/10 p-5 shadow-sm flex flex-col justify-between h-full transition-transform hover:scale-105";
      card.dataset.link = note.link;

      const noteType = getNoteType(note, group.category);
      const badgeMeta = getNotesCategoryMeta(noteType);
      const imageWrap = createNoteImage(getUniqueNoteCoverImage(note, noteType, index) || NOTES_FALLBACK_IMAGE, note.title, badgeMeta);

      const title = document.createElement("h3");
      title.className = "text-xl font-semibold mb-2 text-gray-900";
      title.textContent = note.title;

      const shortDescription = document.createElement("p");
      shortDescription.className = "text-sm text-gray-700 leading-relaxed mb-4";
      shortDescription.textContent = getNoteShortDescription(note);

      const meta = document.createElement("div");
      meta.className =
        "sm:flex items-center sm:justify-between sm:w-full mt-2 pt-3 border-t border-black/10";
      const typeSpan = document.createElement("span");
      typeSpan.className = "inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1 text-sm font-medium text-gray-700";
      typeSpan.innerHTML = '<span class="h-2 w-2 rounded-full bg-red-500"></span>';
      typeSpan.append(`Type: ${noteType}`);

      const priceSpan = document.createElement("span");
      priceSpan.className = "text-lg font-bold text-gray-900";
      priceSpan.textContent = note.price;
      meta.append(typeSpan, priceSpan);

      const noteSlug = createNoteSlug(note.title);

      const viewButton = document.createElement("a");
      viewButton.href = `notes-details.html?note=${encodeURIComponent(noteSlug)}`;
      viewButton.className =
        "mt-4 inline-flex items-center justify-center rounded-lg border border-black/20 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors";
      viewButton.textContent = "View Note";
      viewButton.setAttribute("aria-label", `View ${note.title}`);

      card.append(imageWrap, title, shortDescription, meta, viewButton);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderNotes);
} else {
  renderNotes();
}



            const targetData = typeof notes !== 'undefined' ? notes : [];
            if(targetData) {
                outSql += "-- INSERT notes\n";
                for (const cat of targetData) {
                    if (true) {
                        for (const item of (cat.items || [])) {
                            outSql += `INSERT INTO notes (category, name, short_desc, duration, price, link, cover_image, details, extra_details) VALUES (
  ${sanitizeStr(cat.category)}, ${sanitizeStr(item.name || item.title)}, ${sanitizeStr(item.short_desc || item.shortDescription || item.description?.[0])}, ${sanitizeStr(item.duration || item.date)}, ${sanitizeStr(item.price)}, ${sanitizeStr(item.link)}, ${sanitizeStr(item.coverImage)}, ${objToJson(item.details || item.description)}, ${objToJson(item.view_details)}
);\n`;
                        }
                    } else {
                        outSql += `INSERT INTO faculty (name, topic, stars, price, link, description, cover_image, extra_details) VALUES (
  ${sanitizeStr(cat.name)}, ${sanitizeStr(cat.topic)}, ${sanitizeStr(cat.stars)}, ${sanitizeStr(cat.price)}, ${sanitizeStr(cat.link)}, ${sanitizeStr(cat.description)}, ${sanitizeStr(cat.coverImage)}, ${objToJson(cat.view_details)}
);\n`;
                    }
                }
                outSql += "\n";
            }
        })();
    
        // --- faculty ---
        (() => {
            

const starsData = [
  {
    id: 1,
    name: "Raju Roy",
    designationNow: "Software Engineer at XYZ Corp",
    pic: "/public/assets/images/faculty/male.jpg",
    servicesTaken: ["Full Stack Development", "Interview Prep"],
    starReview: 5,
    textReview: "5EVEN transformed my career. The mentorship was exceptional and helped me land my dream job!"
  },
  {
    id: 2,
    name: "Sushant Sharma",
    designationNow: "Data Scientist at ABC Analytics",
    pic: "/public/assets/images/faculty/male.jpg",
    servicesTaken: ["Machine Learning", "Python Programming"],
    starReview: 5,
    textReview: "Outstanding learning experience. The practical projects prepared me perfectly for industry challenges."
  },
  {
    id: 3,
    name: "Priya Patel",
    designationNow: "AI Research Engineer at Tech Innovations",
    pic: "/public/assets/images/faculty/female.jpg",
    servicesTaken: ["AI Solutions", "Research Paper Writing"],
    starReview: 4.5,
    textReview: "Excellent curriculum and dedicated faculty. Highly recommended for anyone serious about tech careers."
  }
];

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="ri-star-fill text-yellow-500"></i>';
  }
  
  if (hasHalfStar) {
    starsHTML += '<i class="ri-star-half-line text-yellow-500"></i>';
  }
  
  return starsHTML;
}

function renderStarCards() {
  const starsGrid = document.querySelector('.stars-grid');
  
  if (!starsGrid) {
    console.warn('Stars grid not found');
    return;
  }
  
  console.log('Rendering star cards:', starsData.length);
  
  starsGrid.innerHTML = starsData.map(star => {
    const safeName = escapeHtml(star.name);
    const safeDesignation = escapeHtml(star.designationNow);
    const safeReview = escapeHtml(star.textReview);
    const safeRating = escapeHtml(star.starReview);
    const safePic = sanitizeUrl(star.pic, { allowDataImage: true, fallback: "/public/assets/images/faculty/male.jpg" });
    const fallback = sanitizeUrl(`https://via.placeholder.com/128x128?text=${encodeURIComponent(star.name || "User")}`);

    return `
    <div class="star-card flex flex-col gap-4 p-6 border-2 border-dashed border-black/90 rounded-lg hover:shadow-lg transition-shadow items-center justify-center">
      <img src="${safePic}" data-fallback-src="${fallback}" alt="${safeName}" class="w-32 h-32 object-cover rounded-full">
      <div class="star-info flex flex-col gap-3 items-center justify-center text-center">
        <div>
          <p class="text-xl font-bold">${safeName}</p>
          <p class="text-sm text-gray-600">${safeDesignation}</p>
        </div>
        
        <div class="services flex flex-wrap gap-2 justify-center">
          ${star.servicesTaken.map(service => `<span class="badge-small text-xs px-2 py-1 bg-gray-100 rounded-full">${escapeHtml(service)}</span>`).join('')}
        </div>
        
        <div class="flex flex-col items-center gap-1">
          <div class="flex gap-1 justify-center">
            ${renderStars(star.starReview)}
          </div>
          <span class="text-xs text-gray-500">${safeRating} / 5</span>
        </div>
        
        <p class="text-sm text-gray-700 italic">"${safeReview}"</p>
      </div>
    </div>
  `;
  }).join('');

  starsGrid.querySelectorAll("img[data-fallback-src]").forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallbackSrc;
      if (fallback && img.src !== fallback) {
        img.src = fallback;
      }
    }, { once: true });
  });
}

function initializeStarsPage() {
  renderStarCards();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeStarsPage);
} else {
  initializeStarsPage();
}

            const targetData = typeof stats !== 'undefined' ? stats : [];
            if(targetData) {
                outSql += "-- INSERT faculty\n";
                for (const cat of targetData) {
                    if (false) {
                        for (const item of (cat.items || [])) {
                            outSql += `INSERT INTO faculty (category, name, short_desc, duration, price, link, cover_image, details, extra_details) VALUES (
  ${sanitizeStr(cat.category)}, ${sanitizeStr(item.name || item.title)}, ${sanitizeStr(item.short_desc || item.shortDescription || item.description?.[0])}, ${sanitizeStr(item.duration || item.date)}, ${sanitizeStr(item.price)}, ${sanitizeStr(item.link)}, ${sanitizeStr(item.coverImage)}, ${objToJson(item.details || item.description)}, ${objToJson(item.view_details)}
);\n`;
                        }
                    } else {
                        outSql += `INSERT INTO faculty (name, topic, stars, price, link, description, cover_image, extra_details) VALUES (
  ${sanitizeStr(cat.name)}, ${sanitizeStr(cat.topic)}, ${sanitizeStr(cat.stars)}, ${sanitizeStr(cat.price)}, ${sanitizeStr(cat.link)}, ${sanitizeStr(cat.description)}, ${sanitizeStr(cat.coverImage)}, ${objToJson(cat.view_details)}
);\n`;
                    }
                }
                outSql += "\n";
            }
        })();
    
        import { writeFileSync } from 'fs';
        writeFileSync('database_seed.sql', outSql);
        console.log('Successfully generated database_seed.sql with real repo data!');
    