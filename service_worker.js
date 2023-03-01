self.addEventListener('push', function(e) {
    console.log(e, e.data);
    const data = e.data.json();
    self.registration.showNotification(
        data.title,
        {
            body: data.body,
        }
    );
})

