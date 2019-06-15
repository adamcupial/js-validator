(function () {
  var fv = new window.FormValidator(document.getElementById('form'));
  fv.addValidator('name', (field) => {
    if (field.value === 'dsddd') {
      return null;
    } else {
      return 'Error';
    }
  });
}());
