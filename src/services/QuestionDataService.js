import firebase from "firebase";

const db = firebase.database().ref("/questions");

class QuestionDataService {
  getAll() {
    return db;
  }

  create(question) {
    return db.push(question);
  }

  update(key, value) {
    return db.child(key).update(value);
  }

  delete(key) {
    return db.child(key).remove();
  }

  deleteAll() {
    return db.remove();
  }
}

export default new QuestionDataService();