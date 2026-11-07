/** FRONTEND: Fetch + DOM. Ingen direkte databaseadgang. */
const $ = selector => document.querySelector(selector);
const message = text => { $('#message').textContent = text; };

async function request(url, options) {
  const response = await fetch(url, options);
  if (response.status === 204) return null;
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Ukendt fejl');
  return body;
}

async function loadCharacters(name = '') {
  try {
    const characters = await request(`/api/characters?name=${encodeURIComponent(name)}`);
    const list = $('#characters'); list.replaceChildren();
    for (const character of characters) {
      const item = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = `${character.name} – ${character.actor} (${character.firstAppearance}) `;
      const remove = document.createElement('button');
      remove.textContent = 'Slet';
      remove.addEventListener('click', async () => {
        try { await request(`/api/characters/${character.id}`, { method: 'DELETE' }); await loadCharacters(name); }
        catch (error) { message(error.message); }
      });
      item.append(text, remove); list.append(item);
    }
    message(`${characters.length} karakterer fundet`);
  } catch (error) { message(error.message); }
}

$('#search').addEventListener('submit', event => {event.preventDefault(); loadCharacters($('#name').value);});
$('#all').addEventListener('click', () => {$('#name').value='';loadCharacters();});
$('#create').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const body = Object.fromEntries(form.entries());
  body.firstAppearance = Number(body.firstAppearance);
  body.isFavorite = form.has('isFavorite');
  try {
    await request('/api/characters', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    event.target.reset(); await loadCharacters();
  } catch (error) { message(error.message); }
});
$('#external').addEventListener('click', async () => {
  const list = $('#shows'); list.replaceChildren();
  try {
    const shows = await request('/api/external/shows');
    for (const show of shows) {
      const li = document.createElement('li');
      const a = document.createElement('a');a.href=show.tvmazeUrl;a.target='_blank';a.rel='noopener';a.textContent=`${show.title} (${show.premiered || 'ukendt'})`;
      li.append(a);list.append(li);
    }
  } catch (error) { message(error.message); }
});
loadCharacters();
