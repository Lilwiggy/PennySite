fetch('/userprofile', {
  method: 'GET',
  headers: {
    Authorization: localStorage.getItem('t'),
  },
}).then((res) => console.log(res));
