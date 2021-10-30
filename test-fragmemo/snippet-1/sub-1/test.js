# same file name
class Hoge {
  constructor(hoge) {
    this.hoge = hoge;
  }

  say() {
    console.log(this.hoge);
  }
}

const hoge = new Hoge('test');
hoge.say();
