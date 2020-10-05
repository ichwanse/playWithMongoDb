const mongoose = require('mongoose');

//connect to db
mongoose
	.connect('mongodb://localhost/playWithMongoDb', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected'))
	.catch((err) => console.error('Not connect', err));

const authorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255
	},
	bio: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255
	},
	website: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255
	}
});

const Author = mongoose.model('Author', authorSchema);

const Courses = mongoose.model(
	'Course',
	new mongoose.Schema({
		name: {
			type: String,
			required: true,
			minlength: 5,
			maxlength: 255
		},
		authors: [ authorSchema ],
		category: {
			type: String,
			required: true,
			enum: [ 'web', 'mobile', 'network' ],
			uppercase: false,
			trim: true
		},
		// author: String,
		tags: {
			type: Array,
			validate: {
				validator: function(v) {
					return v && v.length > 0;
				},
				message: 'A tag course sould have at least one tag.'
			}
		},
		date: { type: Date, default: Date.now },
		isPublish: Boolean,
		price: {
			type: Number,
			required: true,
			min: 10,
			max: 20000,
			get: (v) => Math.round(v),
			set: (v) => Math.round(v)
		}
	})
);

async function createAuthor(name, bio, website) {
	const author = new Author({
		name,
		bio,
		website
	});
	try {
		const result = await author.save();
		console.log(result);
	} catch (ex) {
		for (field in ex.errors) {
			console.log(ex.message[field].message);
		}
	}
}

async function listCourses() {
	const courses = await Courses.find().populate('author', 'name -_id').select('name author');
	console.log(courses);
}

async function createCourse(author) {
	const course = new Courses({
		name: 'Android Kotlin Course',
		category: 'web',
		tags: [ 'Mobile Developer' ],
		isPublish: true,
		price: 12009,
		author
	});
	try {
		const result = await course.save();
		console.log(result);
	} catch (ex) {
		console.log(ex.message);
	}
}

async function getCourses() {
	const courses = await Courses.find();
	console.log(courses);
}

async function getByPublisher() {
	const courses = await Courses.find({ tags: /^Back/ });
	console.log(courses);
}

async function getNameByAsc() {
	const courses = await Courses.find().sort({ name: -1 });
	console.log(courses);
}

async function getCourses2() {
	return await Courses.find({ isPublish: true, tags: /^Full/ }).sort({ name: 1 }).select({ name: 1, author: 1 });
}

async function getCourses3() {
	return await Courses.find({ isPublish: true })
		.or([ { name: /.*js.*/ }, { price: { $gte: 10000 } } ])
		.select('name author price');
}

async function run() {
	const result = await getCourses3();
	console.log(result);
}

async function updateCourses(id) {
	const result = await Courses.findByIdAndUpdate(id, {
		$set: {
			isPublish: false,
			author: 'Another Author'
		}
	});

	console.log(result);
}

async function updateAuthor(courseId) {
	// updataAuthor method 1
	const result = await Courses.findById(courseId);
	result.author.name = 'Ichwan Suciadi';
	result.save();

	console.log(result);
}

async function updateAuthor(courseId) {
	// updataAuthor method 2
	const result = await Courses.updateOne(
		{ _id: courseId },
		{
			$set: {
				'author.name': 'John Smith',
				'author.bio': 'Biosasiso',
				'author.website': 'a.com'
			}
		}
	);

	console.log(result);
}
async function addAuthor(coursesId, author) {
	const course = await Courses.findById(coursesId);
	course.authors.push(author);
	course.save();
}
async function getAuthorById(authorId) {
	const getAuthor = await Author.findById(authorId);
	console.log(getAuthor);
}

async function removeAuthor(courseId, authorId) {
	const course = await Courses.findById(courseId);
	const author = course.authors.id(authorId);
	author.remove();
	course.save();

	console.log(course.authors);
}

removeAuthor('5f7b4bb921c060ef3bf6ab72', '5f7b507735ce10f02d318284');

// addAuthor('5f7b4bb921c060ef3bf6ab72', new Author({ name: 'whos next', bio: 'next what', website: 'idkwhat.com' }));
// createCourse([
// 	new Author({
// 		name: 'ikhwan',
// 		bio: 'Bio',
// 		website: 'website.com'
// 	}),
// 	new Author({
// 		name: 'budiman',
// 		bio: 'Bios',
// 		website: 'site.com'
// 	}),
// 	new Author({
// 		name: 'budiman takur',
// 		bio: 'Biosasi',
// 		website: 'siteagain.com'
// 	})
// ]);
// updateAuthor('5f7af77f01f861e3a1492e00');
// updateAuthor('5f7902224a501bd1d7744d5c');
// createAuthor('Ichwan', 'Me', 'Ichwan.com');

// createCourse('Android Kotlin Course', '5f78fd0a5771e6ccdd04f3d7');
// createCourse('Android Kotlin Course', new Author({ name: 'ichwan' }));
// listCourses();

// getAuthorById('5f78fd0a5771e6ccdd04f3d7');
// getCourses();
// getByPublisher();
// getNameByAsc();
// run();
// updateCourses('5f76cc944e24d528b1697883');
