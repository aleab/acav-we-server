import open from 'open';
import app from './app';

const PORT = process.env.PORT;
app.set('port', PORT);
app.set('view engine', 'pug');

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${app.get('env')} mode`);

    const args = process.argv.slice(2);
    if (args.includes('--open')) {
        open(`http://localhost:${PORT}/`);
    }
});

export default server;
