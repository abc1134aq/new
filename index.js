const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const moment = require('moment');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// 模拟数据库
let news = [
  { id: 1, title: '江西软件职业技术大学举办编程大赛', content: '为提高学生的编程能力，我校将于下月举办大型编程竞赛。比赛分为Web开发、移动应用开发和人工智能三个类别。参赛学生将有机会展示自己的编程技能，获胜者将获得丰厚奖金和实习机会。', date: '2023-05-01', category: '学术活动', author: '张三', views: 120, comments: [] },
  { id: 2, title: '我校与多家IT企业签署合作协议', content: '为促进产学研结合，江西软件职业技术大学与华为、阿里巴巴、腾讯等多家知名IT企业签署了合作协议。这些合作将为我校学生提供更多的实习和就业机会，同时也将推动我校的科研项目发展。', date: '2023-05-02', category: '校企合作', author: '李四', views: 95, comments: [] },
  { id: 3, title: '2023年春季运动会圆满结束', content: '我校2023年春季运动会于上周圆满结束，共有超过1000名学生参加。本次运动会设立了田径、球类、趣味运动等多个项目，充分展现了我校学生的运动才能和团队精神。', date: '2023-05-03', category: '校园生活', author: '王五', views: 150, comments: [] },
  { id: 4, title: '软件工程专业新增人工智能方向', content: '为适应时代发展需求，我校软件工程专业新增人工智能方向，将于下学期开始招生。新方向将聚焦机器学习、深度学习、计算机视觉等热门领域，为学生未来在AI行业的发展打下坚实基础。', date: '2023-05-04', category: '学术活动', author: '赵六', views: 200, comments: [] },
  { id: 5, title: '校园招聘会吸引众多知名企业', content: '本周三，我校举办了大型校园招聘会，吸引了包括华为、腾讯、字节跳动在内的多家知名企业。许多应届毕业生在现场与企业代表进行了深入交流，部分学生当场获得了面试机会。', date: '2023-05-05', category: '就业信息', author: '钱七', views: 180, comments: [] },
  { id: 6, title: '我校学生在全国软件创新大赛中获奖', content: '在刚刚结束的全国软件创新大赛中，我校计算机科学与技术专业的学生团队凭借其开发的"智能校园导航系统"项目获得了一等奖。该系统采用AR技术，为新生和访客提供了直观的校园导航体验。', date: '2023-05-06', category: '学生成就', author: '孙八', views: 220, comments: [] },
  { id: 7, title: '图书馆举办"阅读马拉松"活动', content: '为培养学生的阅读习惯，图书馆将于下月举办为期一周的"阅读马拉松"活动。参与学生需要在一周内阅读并撰写书评。完成任务的学生将获得证书和奖品，前十名还将获得图书馆VIP卡。', date: '2023-05-07', category: '校园活动', author: '周九', views: 85, comments: [] },
  { id: 8, title: '我校成功举办首届人工智能与大数据论坛', content: '昨日，我校成功举办了首届人工智能与大数据论坛。多位业界专家和学者应邀出席，就AI和大数据在各行业的应用前景进行了深入探讨。此次论坛为我校师生提供了与行业接轨的宝贵机会。', date: '2023-05-08', category: '学术交流', author: '吴十', views: 175, comments: [] },
  { id: 9, title: '软件学院举办程序设计竞赛', content: '软件学院将于下周举办年度程序设计竞赛。本次比赛分为个人赛和团队赛两个类别，题目涵盖算法设计、数据结构等多个方面。获胜者将有机会代表学校参加省级和国家级的程序设计大赛。', date: '2023-05-09', category: '学术活动', author: '郑十一', views: 130, comments: [] },
  { id: 10, title: '我校与江西省软件行业协会建立战略合作', content: '今日，我校与江西省软件行业协会签署了战略合作协议。双方将在人才培养、技术交流、项目合作等方面展开深入合作。这将为我校学生提供更多的实习和就业机会，推动我校软件专业的发展。', date: '2023-05-10', category: '校企合作', author: '王十二', views: 110, comments: [] }
];

const categories = ['学术活动', '校企合作', '校园生活', '就业信息', '通知公告', '学生成就', '校园活动', '学术交流'];

let users = [
  { id: 1, username: 'admin', password: '$2b$10$X4kv7j5ZcG1pFVrMqLdMZOJYOq1/0sMoNE6nYJwsE7xWrdpqpMXYS', role: 'admin', name: '管理员', email: 'admin@jxsoftware.edu.cn', avatar: '/images/avatars/admin.png' },
  { id: 2, username: 'student', password: '$2b$10$X4kv7j5ZcG1pFVrMqLdMZOJYOq1/0sMoNE6nYJwsE7xWrdpqpMXYS', role: 'student', name: '张同学', email: 'student@jxsoftware.edu.cn', avatar: '/images/avatars/student.png' },
  { id: 3, username: 'teacher', password: '$2b$10$X4kv7j5ZcG1pFVrMqLdMZOJYOq1/0sMoNE6nYJwsE7xWrdpqpMXYS', role: 'teacher', name: '李老师', email: 'teacher@jxsoftware.edu.cn', avatar: '/images/avatars/teacher.png' }
];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'jxsoftware-news-system',
  resave: false,
  saveUninitialized: true
}));

// 中间件：检查用户是否已登录
const requireLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// 中间件：检查用户是否为管理员
const requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('权限不足');
  }
};

// 登录页面
app.get('/login', (req, res) => {
  res.render('login');
});

// 处理登录
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = { id: user.id, username: user.username, role: user.role, name: user.name, avatar: user.avatar };
    res.redirect('/');
  } else {
    res.render('login', { error: '用户名或密码错误' });
  }
});

// 注销
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// 首页 - 新闻列表
app.get('/', requireLogin, (req, res) => {
  const { category, search, sort } = req.query;
  let filteredNews = news;

  if (category) {
    filteredNews = filteredNews.filter(item => item.category === category);
  }

  if (search) {
    filteredNews = filteredNews.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.content.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (sort === 'date') {
    filteredNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sort === 'views') {
    filteredNews.sort((a, b) => b.views - a.views);
  }

  res.render('index', { 
    news: filteredNews, 
    categories, 
    currentCategory: category, 
    search,
    sort,
    user: req.session.user,
    moment
  });
});

// 查看新闻详情
app.get('/news/:id', requireLogin, (req, res) => {
  const newsItem = news.find(item => item.id === parseInt(req.params.id));
  if (newsItem) {
    newsItem.views += 1; // 增加浏览量
    res.render('news', { newsItem, user: req.session.user, moment });
  } else {
    res.status(404).send('新闻不存在');
  }
});

// 添加新闻页面
app.get('/add', requireAdmin, (req, res) => {
  res.render('add', { categories, user: req.session.user });
});

// 处理添加新闻
app.post('/add', requireAdmin, (req, res) => {
  const { title, content, category } = req.body;
  const newNews = {
    id: news.length + 1,
    title,
    content,
    category,
    date: moment().format('YYYY-MM-DD'),
    author: req.session.user.name,
    views: 0,
    comments: []
  };
  news.push(newNews);
  res.redirect('/');
});

// 编辑新闻页面
app.get('/edit/:id', requireAdmin, (req, res) => {
  const newsItem = news.find(item => item.id === parseInt(req.params.id));
  if (newsItem) {
    res.render('edit', { newsItem, categories, user: req.session.user });
  } else {
    res.status(404).send('新闻不存在');
  }
});

// 处理编辑新闻
app.post('/edit/:id', requireAdmin, (req, res) => {
  const { title, content, category } = req.body;
  const id = parseInt(req.params.id);
  const newsIndex = news.findIndex(item => item.id === id);
  if (newsIndex !== -1) {
    news[newsIndex] = { ...news[newsIndex], title, content, category };
    res.redirect('/');
  } else {
    res.status(404).send('新闻不存在');
  }
});

// 删除新闻
app.post('/delete/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  news = news.filter(item => item.id !== id);
  res.redirect('/');
});

// 用户管理页面
app.get('/users', requireAdmin, (req, res) => {
  res.render('users', { users, user: req.session.user });
});

// 添加用户页面
app.get('/users/add', requireAdmin, (req, res) => {
  res.render('add-user', { user: req.session.user });
});

// 处理添加用户
app.post('/users/add', requireAdmin, async (req, res) => {
  const { username, password, role, name, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    role,
    name,
    email,
    avatar: `/images/avatars/${role}.png`
  };
  users.push(newUser);
  res.redirect('/users');
});

// 编辑用户页面
app.get('/users/edit/:id', requireAdmin, (req, res) => {
  const userToEdit = users.find(u => u.id === parseInt(req.params.id));
  if (userToEdit) {
    res.render('edit-user', { userToEdit, user: req.session.user });
  } else {
    res.status(404).send('用户不存在');
  }
});

// 处理编辑用户
app.post('/users/edit/:id', requireAdmin, async (req, res) => {
  const { username, password, role, name, email } = req.body;
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    const updatedUser = { ...users[userIndex], username, role, name, email };
    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }
    users[userIndex] = updatedUser;
    res.redirect('/users');
  } else {
    res.status(404).send('用户不存在');
  }
});

// 删除用户
app.post('/users/delete/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter(u => u.id !== id);
  res.redirect('/users');
});

// 添加评论
app.post('/news/:id/comment', requireLogin, (req, res) => {
  const { content } = req.body;
  const newsId = parseInt(req.params.id);
  const newsItem = news.find(item => item.id === newsId);
  if (newsItem) {
    const newComment = {
      id: newsItem.comments.length + 1,
      content,
      author: req.session.user.name,
      date: moment().format('YYYY-MM-DD HH:mm:ss')
    };
    newsItem.comments.push(newComment);
    res.redirect(`/news/${newsId}`);
  } else {
    res.status(404).send('新闻不存在');
  }
});

// 个人中心页面
app.get('/profile', requireLogin, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// 处理更新个人信息
app.post('/profile', requireLogin, async (req, res) => {
  const { name, email, password } = req.body;
  const userIndex = users.findIndex(u => u.id === req.session.user.id);
  if (userIndex !== -1) {
    users[userIndex].name = name;
    users[userIndex].email = email;
    if (password) {
      users[userIndex].password = await bcrypt.hash(password, 10);
    }
    req.session.user = { ...req.session.user, name, email };
    res.redirect('/profile');
  } else {
    res.status(404).send('用户不存在');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});