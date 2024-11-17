require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const connectionDatabase = require('./configs/db.config');
const logger = require('logger').createLogger('development.log');
const Category = require('./models/categories.model');
const Story = require('./models/stories.model');
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const proxy = {
    protocol: 'http',
    host: 'ip.mproxy.vn',
    port: 12336,
    auth: {
        username: 'donpv',
        password: 'sCTf9SKIXKPCGT'
    }

};

const crawl = async (url) => {
    try {
        const response = await axios.get(url, proxy);
        const $ = cheerio.load(response.data);
        logger.info('Crawling data from: ', response.data);
        const links = [];
        ////GET DATA LINK AND NAME CATEGORY
        $('div.categories a').each(async (index, element) => {
            const title = $(element).text();
            const link = $(element).attr('href');
            const existingCategory = await Category.findOne({ link });
            if (!existingCategory) {
                const category = new Category({ title, link });
                await category.save();
                logger.info('Categories ID: ', category._id);
            } else {
                //logger.info('Category already exists: ', link);
            }
            await delay(5000);
        });
        //crawlStories();
        //return [];
    } catch (error) {
        console.error(error);
        return [];
    }
}

const crawlStories = (async () => {
    const category = await Category.find({});
    console.log('Category: ', category.length);
    const lenghCategory = category.length;

    for (let j = 0; j < lenghCategory; j++) {
        const url = category[j].link; // URL trang mục tiêu
        const responsePage = await axios.get(url, proxy);
        const _$ = cheerio.load(responsePage.data);

        const categoryId = await Category.findOne({ link: url });
        // Kiểm tra danh sách phân trang
        const pagination = _$('ul.pagination');
        if (pagination.length === 0) {
            console.error('Không tìm thấy phân trang.');
            return;
        }
        // Tìm tất cả số trang trong các thẻ <li> (không tính dấu ...)
        let lastPage = 1;
        pagination.find('li a').each((index, element) => {
            const pageText = _$(element).text().trim();
            const pageNum = parseInt(pageText, 10);

            if (!isNaN(pageNum)) {
                lastPage = Math.max(lastPage, pageNum);
            }
        });
        console.log(`Số trang cuối cùng: ${lastPage} ${categoryId._id}}`);
        for (let i = 1; i < lastPage; i++) {
            const response = await axios.get(`${url}/${i}`, proxy);
            const $ = cheerio.load(response.data);
            //logger.info('Crawling data from: ', response.data);
            const stories = [];

            $('li.story-list').each(async (index, element) => {
                const story = $(element);
                const link = story.find('a');
                const isLink = link.attr('href');
                const img = story.find('img');
                const author = story.find('p[itemprop="author"]').text().trim();
                const existingCategory = await Story.findOne({ isLink });
                if (!existingCategory) {
                    await Story.findOneAndUpdate(
                        { link: isLink }, // Điều kiện tìm kiếm
                        {
                            title: link.attr('title'),
                            link: isLink,
                            image: img.attr('data-layzr'),
                            author: author,
                            categoryId: categoryId._id.toString()
                        },
                        { upsert: true, new: true } // Tạo mới nếu không tồn tại, trả về tài liệu mới nhất
                    );
                }
            });
            logger.info('Stories: ', stories);
            await delay(5000);
        }
        await delay(10000);
    }


});

const crawlChapter = async (url) => {
    const response = await axios.get("");
    const $ = cheerio.load(response.data);
    logger.info('Crawling data from: ', response.data);
    const links = [];
    //GET DATA LINK AND NAME CHAPTER
    $('div#chapters ul.chapters a').each(async (index, element) => {
        const title = $(element).text();
        const link = $(element).attr('href');
        links.push({ title, link });
        logger.info('Crawling data from: ', title, link);
    });
}

const main = async () => {
    await connectionDatabase();
    const url = 'https://dtruyen.net/';
    //const crawlData = await crawl(url);
    const data = await crawlStories();
}

main();