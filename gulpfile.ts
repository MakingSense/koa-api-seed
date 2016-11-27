import {Gulpclass, Task, SequenceTask, MergedTask} from 'gulpclass/Decorators';

import * as gulp from 'gulp';
import * as del from 'del';
import * as ts from 'gulp-typescript';
import * as nodemon from 'gulp-nodemon';
import * as mocha from 'gulp-mocha';
import * as replace from 'gulp-replace';


let tsProject = ts.createProject('tsconfig.json');
let argv = require('yargs').argv;

@Gulpclass()
export class Gulpfile {

    @Task()
    clean(next: Function) {
        return del(['./build/**'], next);
    }

    @MergedTask()
    copy() {
        let copyFiles = gulp
            .src(['.env', '.npmrc', 'package.json', 'logs'])
            .pipe(gulp.dest('./build'));
        let copyEbextensions = gulp
            .src(['.ebextensions/**/*'])
            .pipe(gulp.dest('./build/.ebextensions'));
        let createLogsFolder = gulp
            .src('logs/README.md')
            .pipe(gulp.dest('./build/logs'));

        return [copyFiles, copyEbextensions, createLogsFolder];
    }

    @MergedTask()
    compile() {
        let tsResult = tsProject
            .src()
            .pipe(tsProject());

        return [
            tsResult.js.pipe(gulp.dest('build')),
            tsResult.dts.pipe(gulp.dest('build'))
        ];
    }

    @Task()
    watch() {
        gulp.watch(['**/*.ts', '!gulpfile.ts', '!build/', '.env'], ['compile']);
    }

    @Task()
    replace() {
        return gulp.src(['build/.npmrc'])
            .pipe(replace('${NPM_TOKEN}', process.env.NPM_TOKEN))
            .pipe(gulp.dest('build/'));
    }

    @Task()
    e2e() {
        process.env.NODE_ENV = 'test';
        let src = argv.src? `build/${argv.src.replace('.ts', '.js')}` : ['build/**/*.e2e.js', 'build/**/*.spec.js'];
        gulp.src(src, {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
            .pipe(mocha({timeout: 60000}))
            .once('end', () => {
                process.exit();
            });
    }

    @SequenceTask()
    test() {
        return ['clean', 'compile', 'copy', 'e2e'];
    }

    @SequenceTask() // this special annotation using 'run-sequence' module to run returned tasks in sequence
    build() {
        return ['clean', 'compile', 'copy', 'replace', 'zip'];
    }

    @SequenceTask()
    default() {
        return ['build'];
    }

    @SequenceTask()
    serve() {
        return ['clean', 'compile', 'copy', 'run', 'watch'];
    }

    @Task()
    run(next: Function) {
        let stream = nodemon({
            script: './build/index.js',
            ext: 'js json',
            watch: ['build/**.js']
        });

        next();
    }

}