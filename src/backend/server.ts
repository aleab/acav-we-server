import open from 'open';
import app from './app';

const PORT = process.env.PORT;
app.set('port', PORT);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${app.get('env')} mode`);
    open(`http://localhost:${PORT}/`);
});

export default server;
