import os, glob, shutil

# Create downloads.html by copying projects.html
shutil.copy('projects.html', 'downloads.html')

# Update downloads.html content to reflect Downloads page
with open('downloads.html', 'r', encoding='utf-8') as f:
    d = f.read()
d = d.replace('My Projects - VoiceNova', 'Downloads - VoiceNova')
d = d.replace('My Projects Console', 'Downloads History')
d = d.replace('Projects', 'Downloads')
d = d.replace('projects', 'downloads')
d = d.replace('downloads-table', 'projects-table')
d = d.replace('downloads.js', 'projects.js') # Keep the same js logic for the table
with open('downloads.html', 'w', encoding='utf-8') as f:
    f.write(d)

# Update all sidebar links
for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the empty link with a link to downloads.html
    new_content = content.replace('<a href="#" class="sidebar-link"><i data-lucide="download-cloud"></i> <span>Downloads</span></a>', 
                                  '<a href="downloads.html" class="sidebar-link"><i data-lucide="download-cloud"></i> <span>Downloads</span></a>')
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
