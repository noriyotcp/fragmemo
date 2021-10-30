class Hoge {
  constructor(hoge: string) {
    this.hoge = hoge;
  }

  say() {
    console.log(this.hoge);
  }
}

const hoge = new Hoge('test');
hoge.say();
