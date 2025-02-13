const { Sequelize, DataTypes } = require('sequelize')

/* Development */
// const db = new Sequelize(
//   'postgres://postgres:postgres@localhost:5432/Hypermedia'
// )
/* Production */
const pg = require('pg')
pg.defaults.ssl = true
const db = new Sequelize(process.env.DATABASE_URL, {
  ssl: true,
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
})

/**
 * Function to define the structure of the database
 */
function defineDatabaseStructure() {
  const Person = db.define(
    'person',
    {
      name: DataTypes.STRING,
      intro: DataTypes.TEXT,
      description: DataTypes.TEXT,
      role: DataTypes.STRING,
      image: DataTypes.STRING,
      linkedin: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  )
  const Area = db.define(
    'area',
    {
      name: DataTypes.STRING,
      subtitle: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      shortcut_image: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  )
  const Product = db.define(
    'product',
    {
      name: DataTypes.STRING,
      subtitle: DataTypes.STRING,
      logo: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  )
  const Customer = db.define(
    'customer',
    {
      image: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  )
  const AreaDetail = db.define(
    'areaDetail',
    {
      name: DataTypes.STRING,
      subtitle: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  )
  const ProductDetail = db.define(
    'productDetail',
    {
      name: DataTypes.STRING,
      subtitle: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
    },
    {
      underscored: true,
    }
  )
  // X belongsTo Y --> X has the fk
  // Creating the 1 -> N association between Person and Area in which they work
  Person.belongsTo(Area, {
    as: 'working_area',
    foreignKey: {
      name: 'working_area_id',
      allowNull: false,
    },
    constraints: false,
  })
  Area.hasMany(Person, {
    as: 'employees',
    foreignKey: 'working_area_id',
    constraints: false,
  })
  // Creating the 1 -> 1 association between Person and Area for which they are responsible
  Area.belongsTo(Person, {
    as: 'manager',
    foreignKey: {
      name: 'manager_id',
    },
    constraints: false,
  })
  Person.hasOne(Area, {
    as: 'manager_of_area',
    foreignKey: 'manager_id',
    constraints: false,
  })
  // Creating the 1 -> 1 association between Person and Product for which they are the reference for the assistance
  Product.belongsTo(Person, {
    as: 'assistance_referent',
    foreignKey: {
      name: 'assistance_referent_id',
      allowNull: false,
    },
    constraints: false,
  })
  Person.hasOne(Product, {
    as: 'assistance_referent_of',
    foreignKey: 'assistance_referent_id',
    constraints: false,
  })
  // Creating the 1 -> 1 association between Person and Product for which he/she is the product manager
  Product.belongsTo(Person, {
    as: 'product_manager',
    foreignKey: {
      name: 'product_manager_id',
      allowNull: false,
    },
    constraints: false,
  })
  Person.hasOne(Product, {
    as: 'product_manager_of',
    foreignKey: 'product_manager_id',
    constraints: false,
  })
  // Creating the 1 -> N association between Product and Area in which it belongs to
  Product.belongsTo(Area, {
    as: 'membership_area',
    foreignKey: {
      name: 'area_id',
      allowNull: false,
    },
    constraints: false,
  })
  Area.hasMany(Product, {
    as: 'products',
    foreignKey: 'area_id',
    constraints: false,
  })
  // Creating the 1 -> N association between Area and Detail that it has for its description
  Area.hasMany(AreaDetail, {
    as: 'area_details',
    foreignKey: {
      name: 'area_id',
      allowNull: false,
    },
  })
  // Creating the 1 -> N association between Product and Detail that it has for its description
  Product.hasMany(ProductDetail, {
    as: 'product_details',
    foreignKey: {
      name: 'product_id',
      allowNull: false,
    },
  })
  // Creating the N -> N association between Product and Customers that it has
  Product.belongsToMany(Customer, {
    as: 'customers',
    through: 'ProductCustomers',
  })

  db._tables = {
    Person,
    Area,
    Product,
    AreaDetail,
    ProductDetail,
    Customer,
  }
}

/**
 * Function to insert some fake info in the database
 */
async function insertFakeData() {
  const { Person, Area, Product, AreaDetail, ProductDetail, Customer } =
    db._tables
  // Create 2 Areas
  const area1 = await Area.create({
    name: 'Security',
    subtitle: 'Partnering with customers to manage digital risk.',
    description:
      'We are unique among IT security consulting firms. We combine security technology engineering, intelligence expertise and our data science DNA to help companies manage digital risk end-to-end.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0143.png',
    shortcut_image:
      'https://www.moviri.com/wp-content/uploads/2020/11/bl-icon-security@2x.png',
  })
  const area2 = await Area.create({
    name: 'Artificial Intelligence',
    subtitle:
      'Autonomous optimization driven by machine learning and automation.',
    description:
      'The complexity of modern technology stacks and application pipelines requires end-to-end automation. We use machine learning techniques and the right tooling to create automated, full-stack, closed-loop performance engineering solutions.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0190.png',
    shortcut_image:
      'https://cdn0.iconfinder.com/data/icons/adobe-application/100/Ai_Icon-256.png',
  })
  // Create 4 Person
  const person1 = await Person.create({
    name: 'Luca Colombo',
    role: 'Software Engineer',
    intro: "I'm a Software Engineer and a Backend Developer from Milan, Italy",
    description: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
    tempor incidunt ut labore et ssdolore magna aliqua. Ut enim ad minim
    veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid
    ex ea commodi consequatur. Duis a ute irure reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    obcaecat cupiditat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
    linkedin: 'https://it.linkedin.com/',
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/matteo_fabiano2.jpg',
    working_area_id: area1.id,
  })
  area1.setManager(person1)
  const person2 = await Person.create({
    name: 'Sara Bianchi',
    role: 'Security Expert',
    intro:
      "I'm a Security Expert with a great passion in solving puzzles and I'm from Rome, Italy",
    description: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
    tempor incidunt ut labore et ssdolore magna aliqua. Ut enim ad minim
    veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid
    ex ea commodi consequatur. Duis a ute irure reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    obcaecat cupiditat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
    linkedin: 'https://it.linkedin.com/',
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Camilla-Stefani-1.jpg',
    working_area_id: area1.id,
  })
  const person3 = await Person.create({
    name: 'Matteo Rossi',
    role: 'AI Expert',
    intro:
      "I'm an AI Expert and an Artificial Neural Network researcher from Venice, Italy",
    description: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
    tempor incidunt ut labore et ssdolore magna aliqua. Ut enim ad minim
    veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid
    ex ea commodi consequatur. Duis a ute irure reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    obcaecat cupiditat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
    linkedin: 'https://it.linkedin.com/',
    image: 'https://www.moviri.com/wp-content/uploads/2021/04/enrico-maini.jpg',
    working_area_id: area2.id,
  })
  area2.setManager(person3)
  const person4 = await Person.create({
    name: 'Christian Verdi',
    role: 'Data Scientist',
    intro:
      "I'm a Data Scientist and a Python Programmer from Sydney, Australia",
    description: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
    tempor incidunt ut labore et ssdolore magna aliqua. Ut enim ad minim
    veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid
    ex ea commodi consequatur. Duis a ute irure reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    obcaecat cupiditat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
    linkedin: 'https://it.linkedin.com/',
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Fabio-Violante-1.jpg',
    working_area_id: area2.id,
  })
  const person5 = await Person.create({
    name: 'Francesco Blu',
    role: 'Data Analist',
    intro: "I'm a Data Analist and a Frontend Developer from Paris, France",
    description: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
    tempor incidunt ut labore et ssdolore magna aliqua. Ut enim ad minim
    veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid
    ex ea commodi consequatur. Duis a ute irure reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    obcaecat cupiditat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
    linkedin: 'https://it.linkedin.com/',
    image: 'https://www.moviri.com/wp-content/uploads/2021/06/luca-forni.jpg',
    working_area_id: area2.id,
  })
  const person6 = await Person.create({
    name: 'Mattia Viola',
    role: 'Software Engineer',
    intro:
      "I'm a Software Engineer and a Backend Developer from Los Angeles, USA",
    description: `Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
    tempor incidunt ut labore et ssdolore magna aliqua. Ut enim ad minim
    veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut aliquid
    ex ea commodi consequatur. Duis a ute irure reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    obcaecat cupiditat non proident, sunt in culpa qui officia deserunt
    mollit anim id est laborum.`,
    linkedin: 'https://it.linkedin.com/',
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Matteo-Bogana.jpg',
    working_area_id: area2.id,
  })
  // Create 3 Products
  const product1 = await Product.create({
    name: 'Cleafy',
    subtitle: 'At your side, fighting against online fraud.',
    logo: 'https://www.moviri.com/wp-content/uploads/elementor/thumbs/Cleafy-Logo-p4x9d3ef1luvofs4qsvcwnjxn2iil5g091wbunncw0.png',
    description:
      'Cleafy helps banks and financial institutions scale-up their fight against online fraud. Cleafy is the first solution to introduce full detection and response in online fraud prevention. A revolutionary technology that combines the most advanced fraud detection capabilities, with the possibility to set-up automated responses. All in one central platform.',
    image:
      'https://www.moviri.com/wp-content/uploads/2021/03/cleafy-dashboard.png',
    area_id: area1.id,
    product_manager_id: person1.id,
    assistance_referent_id: person2.id,
  })
  const product2 = await Product.create({
    name: 'Akamas',
    subtitle: 'The Autonomous Performance Optimization AI.',
    logo: 'https://www.moviri.com/wp-content/uploads/2020/11/akamas.png',
    description:
      'Akamas is a new, category-defining software that delivers autonomous and continuous performance optimization, powered by machine learning, extracting unprecedented levels of performance and cost savings from technology stacks.',
    image:
      'https://www.moviri.com/wp-content/uploads/2020/11/showcase-akamas1.png',
    area_id: area2.id,
    product_manager_id: person3.id,
    assistance_referent_id: person4.id,
  })
  const product3 = await Product.create({
    name: 'ContentWise',
    subtitle: 'User Experience, Front and Center.',
    logo: 'https://www.moviri.com/wp-content/uploads/2020/11/contentwise.png',
    description:
      'Compelling, relevant and adaptive customer experience is no longer a nice-to-have. ContentWise automatically manages digital storefronts and catalog metadata to create superior customer experiences.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/contentwise2.png',
    area_id: area2.id,
    product_manager_id: person5.id,
    assistance_referent_id: person6.id,
  })
  // Create some Details for area 1
  const areaDetail1 = await AreaDetail.create({
    name: 'Continuous Monitoring & Risk Evaluation',
    subtitle: 'Real-time security data collection and analysis.',
    description:
      'We leverage frameworks and standards such as MITRE to design systems that collect, normalize and analyze security data in real-time. We use intelligence tools to generate insights that limit risk exposure, while reducing operational effort.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0220.png',
    area_id: area1.id,
  })
  const areaDetail2 = await AreaDetail.create({
    name: 'Digital Identity for Critical Services',
    subtitle: 'Visibility and control of privileged and 3rd-party access.',
    description:
      'We provide the tools to ensure that all users and all device access activities are visible and controllable. We also support governance processes to control critical access, such as access by privileged parties or by third-parties, both to services and to data.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0143.png',
    area_id: area1.id,
  })
  const areaDetail3 = await AreaDetail.create({
    name: 'Cloud Security Zero-Trust Architecture',
    subtitle: 'Cloud and multi-cloud policies enforcement and monitoring.',
    description:
      'As companies migrate services and data to the cloud, we have a range of solutions for cloud native application and infrastructure, risk monitoring of cloud traffic and multi-cloud integrations, security enforcement, continuous monitoring for cloud native services, SASE and CASB implementation, containers and serverless security.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0380.png',
    area_id: area1.id,
  })
  const areaDetail4 = await AreaDetail.create({
    name: 'Cyber & Enterprise Risk Integration',
    subtitle: 'Cybersecurity integration with ERM systems and frameworks.',
    description:
      'We offer solutions specifically designed to help enterprises meet regulatory and governance challenges, including enterprise risk management and compliance around a variety of governance frameworks.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0385.png',
    area_id: area1.id,
  })
  const areaDetail5 = await AreaDetail.create({
    name: 'AI-Based Fraud & Threat Intelligence',
    subtitle: 'Advanced threat intelligence and fraud investigation.',
    description:
      'With our threat analysis and response orchestration solution, we create early detection systems for threats. We also create automatic orchestration response solutions that actively react to attack campaigns in a scalable way.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0187.png',
    area_id: area1.id,
  })
  // Create some Details for area 2
  const areaDetail6 = await AreaDetail.create({
    name: 'Continuous Monitoring & Risk Evaluation',
    subtitle: 'Real-time security data collection and analysis.',
    description:
      'We leverage frameworks and standards such as MITRE to design systems that collect, normalize and analyze security data in real-time. We use intelligence tools to generate insights that limit risk exposure, while reducing operational effort.',
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/cloud-optimization.png',
    area_id: area2.id,
  })
  const areaDetail7 = await AreaDetail.create({
    name: 'Digital Identity for Critical Services',
    subtitle: 'Visibility and control of privileged and 3rd-party access.',
    description:
      'We provide the tools to ensure that all users and all device access activities are visible and controllable. We also support governance processes to control critical access, such as access by privileged parties or by third-parties, both to services and to data.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0137.png',
    area_id: area2.id,
  })
  const areaDetail8 = await AreaDetail.create({
    name: 'Cloud Security Zero-Trust Architecture',
    subtitle: 'Cloud and multi-cloud policies enforcement and monitoring.',
    description:
      'As companies migrate services and data to the cloud, we have a range of solutions for cloud native application and infrastructure, risk monitoring of cloud traffic and multi-cloud integrations, security enforcement, continuous monitoring for cloud native services, SASE and CASB implementation, containers and serverless security.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0191.png',
    area_id: area2.id,
  })
  const areaDetail9 = await AreaDetail.create({
    name: 'Cyber & Enterprise Risk Integration',
    subtitle: 'Cybersecurity integration with ERM systems and frameworks.',
    description:
      'We offer solutions specifically designed to help enterprises meet regulatory and governance challenges, including enterprise risk management and compliance around a variety of governance frameworks.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0190.png',
    area_id: area2.id,
  })
  const areaDetail10 = await AreaDetail.create({
    name: 'AI-Based Fraud & Threat Intelligence',
    subtitle: 'Advanced threat intelligence and fraud investigation.',
    description:
      'With our threat analysis and response orchestration solution, we create early detection systems for threats. We also create automatic orchestration response solutions that actively react to attack campaigns in a scalable way.',
    image: 'https://www.moviri.com/wp-content/uploads/2020/12/picture-0018.png',
    area_id: area2.id,
  })
  // Create some Details for product 1
  const productDetail1 = await ProductDetail.create({
    name: 'Gather every information in one place',
    subtitle: '',
    description:
      'Cleafy’s engine collects all possible data in real-time, just on one platform. Having full visibility on all your channels increases your control in every situation. With just a few clicks, you can examine all your online users’ activities and conduct a specific quick investigation thanks to a flexible yet powerful query language.',
    image: 'https://www.akamas.io/wp-content/uploads/2021/04/big-data@2x.png',
    product_id: product1.id,
  })
  const productDetail2 = await ProductDetail.create({
    name: 'Create detection rules',
    subtitle: '',
    description:
      'Cleafy’s ML algorithms indicate any behavioral, transactional, or device-related irregularity. Clear tags help you detect any anomalies for each session, as they happen. Once you identify a malicious pattern, the engine will learn how to detect that. It will then automatically recognize it whenever and wherever it encounters one.',
    image:
      'https://www.akamas.io/wp-content/uploads/2021/05/service_resilience1@2x.png',
    product_id: product1.id,
  })
  const productDetail3 = await ProductDetail.create({
    name: 'Set-up automated responses',
    subtitle: '',
    description:
      'With automated responses precisely targeted on malicious sessions, you can respond faster to any threat, even when they strike at scale. Automated responses aren’t just faster, they’re also more precise. They stop only those in need to be stopped, without interrupting your real users.',
    image:
      'https://uploads-ssl.webflow.com/6020129a813fe0c8f1e8053e/605a231aff6896834273b413_Cleafy-RealTime-p-2000.png',
    product_id: product1.id,
  })
  const productDetail4 = await ProductDetail.create({
    name: 'Keep your KPIs under control',
    subtitle: '',
    description:
      'From your dashboard, you can observe the metrics that matter the most for you. They will let you know if something is off so that you can quickly create new rules or refine the existing ones. Having full control of the situation will reduce the stress on your team, and you can concentrate on developing new businesses. Look ahead, Cleafy has got your back.',
    image:
      'https://uploads-ssl.webflow.com/6020129a813fe0c8f1e8053e/605a231ae93af4c47433886e_Cleafy-Threats-p-1080.png',
    product_id: product1.id,
  })
  // Create some Details for product 2
  const productDetail5 = await ProductDetail.create({
    name: 'CLOUD EFFICIENCY',
    subtitle: 'Optimize cloud cost AND performance',
    description:
      'Cloud cost optimization solutions and vendor tools focus on cost efficiency at the expense of real application performance. Leverage Akamas AI-powered optimization to explore the cheapest Amazon EC2, GCP, and Microsoft Azure options, while also maximizing end-to-end service performance.',
    image:
      'https://www.akamas.io/wp-content/uploads/2021/05/cloud_efficiency@2x.png',
    product_id: product2.id,
  })
  const productDetail6 = await ProductDetail.create({
    name: 'BIG DATA',
    subtitle: 'Optimize Spark jobs at enterprise scale',
    description:
      'Configuring Spark for maximum job performance is more art than science. Job size, data volumes, and other factors impact completion time and ability to stay within execution windows. Leverage Akamas goal-driven optimization to configure Spark, AWS EMR, and Google DataProc to minimize resource usage, maximize applications performance, reduce costs and meet SLOs.',
    image: 'https://www.akamas.io/wp-content/uploads/2021/04/big-data@2x.png',
    product_id: product2.id,
  })
  const productDetail7 = await ProductDetail.create({
    name: 'DATABASE OPTIMIZATION',
    subtitle: 'Automate DB tuning for higher performance',
    description:
      'MongoDB, MySQL, PostgreSQL have hundreds of parameters that impact application performance. Manual tuning is time consuming and overburdens DBAs. Leverage Akamas autonomous optimization to maximize application throughput, while reducing the cost of database licenses and cloud services such as Amazon RDS, Microsoft Azure Database, Google Cloud SQL.',
    image:
      'https://www.akamas.io/wp-content/uploads/2021/05/database_optimization@2x.png',
    product_id: product2.id,
  })
  const productDetail8 = await ProductDetail.create({
    name: 'JAVA TUNING',
    subtitle: 'Tame the JVM',
    description:
      'JVM performance optimization challenges even the most experienced Java experts. Manually tuning hundreds of JVM parameters is time consuming and does not ensure adequate response times or minimum resource usage. Leverage Akamas out-of-the-box JVM optimization pack to automatically maximize the performance and resilience of your Java applications.',
    image:
      'https://www.akamas.io/wp-content/uploads/2021/04/illustrazione1@2x.png',
    product_id: product2.id,
  })
  // Create some Details for product 3
  const productDetail9 = await ProductDetail.create({
    name: 'Full-page Optimization',
    subtitle: 'UX Engine personalizes the entire UI, non just content.',
    description:
      'UX Engine controls not just elements inside a predefined carousel or “widget” but it also reorganizes layout elements themselves, extending personalization to the entire page. No need to build layouts manually and to use static segmentation of your user base.',
    image:
      'https://www.contentwise.com/cw-media/2019/10/Full-page-Optimization.svg',
    product_id: product3.id,
  })
  const productDetail10 = await ProductDetail.create({
    name: 'AI-Assisted Editorial Control',
    subtitle: 'The right mix of human wisdom and algorithmic automation.',
    description:
      'UX Engine can seamlessly blend the two approaches, enabling use cases where editorial selection recipes are enhanced by algorithmic personalization. Different curation approaches and personalization mechanisms blend and interlock for maximum flexibility.',
    image: 'https://www.contentwise.com/cw-media/2019/10/AI-Assisted-Editorial-Control.svg',
    product_id: product3.id,
  })
  const productDetail11 = await ProductDetail.create({
    name: 'Open Connector Ecosystem',
    subtitle: 'A platform to integrate and manage third-party applications.',
    description:
      'UX Engine can integrate and manage third-party applications and use cases. Capable of supporting content discovery, search and content feeds from any third party service, ContentWise is an open platform for experience management.',
    image:
      'https://www.contentwise.com/cw-media/2019/10/Open-Connector-Ecosystem.svg',
    product_id: product3.id,
  })
  const productDetail12 = await ProductDetail.create({
    name: 'AI-Powered UX Assistant',
    subtitle: 'A 24/7 data concierge at your service.',
    description:
      'Data Insights’ UX Assistant, benchmarking historical information, highlights areas of improvement to suggest incremental changes and maximize personalization impact. Spot and act on every bit of optimization data.',
    image:
      'https://i0.wp.com/www.contentwise.com/cw-media/2021/02/AI-powered-UX-Assistant-620x344.png',
    product_id: product3.id,
  })
  // Create some Customers
  const customer1 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Sky@2x-150x150.png',
  })
  const customer2 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Vodafone@2x-150x150.png',
    product_id: product1.id,
  })
  const customer3 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Bell@2x-150x150.png',
  })
  const customer4 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Macys@2x-150x150.png',
  })
  const customer5 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Walmart@2x-150x150.png',
  })
  const customer6 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/ATAT@2x-150x150.png',
  })
  const customer7 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/DeutscheBank@2x-150x150.png',
  })
  const customer8 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/nexi@2x-150x150.png',
  })
  const customer9 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Adobe@2x-150x150.png',
  })
  const customer10 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/fastweb@2x-150x150.png',
  })
  const customer11 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/Unicredit@2x-150x150.png',
  })
  const customer12 = await Customer.create({
    image:
      'https://www.moviri.com/wp-content/uploads/2020/12/barclays-150x150.png',
  })
  product1.setCustomers([
    customer1,
    customer2,
    customer3,
    customer4,
    customer5,
    customer6,
    customer7,
    customer8,
  ])
  product2.setCustomers([
    customer9,
    customer10,
    customer11,
    customer12,
    customer5,
    customer2,
    customer1,
    customer8,
  ])
  product3.setCustomers([
    customer9,
    customer8,
    customer2,
    customer12,
    customer4,
    customer10,
    customer1,
    customer5,
  ])
}

/**
 * Function to initialize the database. This is exported and called in the main api.js file
 */
async function initializeDatabase() {
  // Call the function for the database structure definition
  defineDatabaseStructure()
  // Synchronize Sequelize with the actual database
  await db.sync({ force: true })
  // Call the function to insert some fake data
  await insertFakeData()
  return db
}

export default initializeDatabase
