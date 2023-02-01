import * as ejs from 'ejs';

export function render(content, data) {
    return ejs.render(content, data);
}