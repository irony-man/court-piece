var id='';
var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
for ( var i = 0; i < 6; i++ )
id += characters.charAt(Math.floor(Math.random() * characters.length));

export default id;