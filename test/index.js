/* eslint-env mocha */

var assert = require('assert')
var fs = require('fs')
var os = require('os')

var dataset = require('..')

var test_data = {
  'my-file.txt': {
    url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/my-file.txt',
    hash: '8b4781a921e9f1a1cb5aa3063ca8592cac3ee39276d8e8212b336b6e73999798'
  },
  'another_file.txt': {
    url: 'https://raw.githubusercontent.com/empiricalci/fixtures/master/another_file.txt',
    hash: '0f431dfe11d428f809edb32a31867be71e753f9203945676cbc77c514c7324bf'
  },
  'invalid_file': {
    url: 'https://raw.githubusercontent.com/empiricalci/fixtures/another_file.txt',
    hash: 'abcd6899095d366f25a612e56d8b4ebd32c6914288991e3a8a48265c38e6b6cb' // invalid hash
  }
}

var tmpDir = os.tmpdir()

describe('Install files', function () {
  it('should download and cache the files', function (done) {
    this.timeout(30000)
    dataset.install(test_data, tmpDir).then(function (files) {
      var keys = Object.keys(files)
      keys.forEach(function (k) {
        var file = files[k]
        assert(fs.lstatSync(file.path).isFile())
        if (k !== 'invalid_file') { // valid files
          assert.equal(file.hash, test_data[k].hash)
          assert(file.valid)
        } else {
          assert.notEqual(file.hash, test_data[k].hash)
        }
      })
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_data, tmpDir).then(function (files) {
      var keys = Object.keys(files)
      keys.forEach(function (k) {
        var file = files[k]
        assert(fs.lstatSync(file.path).isFile())
        if (k !== 'invalid_file') { // valid files
          assert(file.valid)
          assert.equal(file.hash, test_data[k].hash)
          assert(file.cached)
        } else {
          assert.notEqual(file.hash, test_data[k].hash)
          assert.equal(file.cached, false)
        }
      })
      done()
    }).catch(done)
  })
})

var test_dirs = {
  'my-files': {
    url: 'https://github.com/empiricalci/fixtures/raw/master/my-files.tar.gz',
    hash: '0e4710c220e7ed2d11288bcf3cf111ac01bdd0cb2a4d64f81455c5b31f1a4fbe',
    directory: true
  }
}

describe('Install tarballs', function () {
  it('should download and uncompress the file', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs, tmpDir).then(function (dirs) {
      var dir = dirs['my-files']
      assert(fs.lstatSync(dir.path).isDirectory())
      assert(dir.valid)
      assert.equal(dir.hash, test_dirs['my-files'].hash)
      done()
    }).catch(done)
  })
  it('should have cached valid objects', function (done) {
    this.timeout(30000)
    dataset.install(test_dirs, tmpDir).then(function (dirs) {
      var dir = dirs['my-files']
      assert(fs.lstatSync(dir.path).isDirectory())
      assert(dir.valid)
      assert.equal(dir.hash, test_dirs['my-files'].hash)
      assert(dir.cached)
      done()
    }).catch(done)
  })
})

var test_zip = {
  url: 'https://github.com/empiricalci/fixtures/raw/master/fixtures-0.1.zip',
  hash: '5c9c3ff715bac9faa626f6e0e1da60c976c279c94d931388c6aaaf38456957d8',
  directory: true
}

describe('Get directory from zip', function () {
  it('should download and uncompress the file', function (done) {
    this.timeout(80000)
    dataset.get(test_zip, tmpDir).then(function (dir) {
      assert(fs.lstatSync(dir.path).isDirectory(), 'Path is not  a directory')
      assert.equal(dir.hash, test_zip.hash)
      assert(dir.valid, 'Checksum is not valid')
      done()
    }).catch(done)
  })
})

var no_hash = {
  url: 'https://raw.githubusercontent.com/empiricalci/fixtures/data.csv'
}

var no_hash_dir = {
  url: 'https://github.com/empiricalci/fixtures/archive/master.zip',
  directory: true
}

var url_with_query = {
  url: 'https://www.dropbox.com/s/mgh53u1ispmpfub/fixtures-0.1.zip?dl=1',
  directory: true
}

describe('Get a file without a hash', function () {
  it('should download a file without validating it', function (done) {
    dataset.get(no_hash, tmpDir).then(function (file) {
      assert(fs.lstatSync(file.path).isFile())
      assert.notEqual(file.valid, true)
      done()
    }).catch(done)
  })
  it('should download and uncompress a .zip without validating it', function (done) {
    dataset.get(no_hash_dir, tmpDir).then(function (dir) {
      assert(fs.lstatSync(dir.path).isDirectory(), 'Path is not a directory')
      assert.notEqual(dir.valid, true, 'Directory is valid')
      done()
    }).catch(done)
  })
  it('should download and uncompress a .zip from a url with query params', function (done) {
    dataset.get(url_with_query, tmpDir).then(function (dir) {
      assert(fs.lstatSync(dir.path).isDirectory(), 'Path is not a directory')
      assert.notEqual(dir.valid, true, 'Directory is valid')
      done()
    }).catch(done)
  })
})
