import fs from 'fs';

let code = fs.readFileSync('src/pages/SevenMod.jsx', 'utf8');

// Find the header button block where New Entry is created
const searchButton = '<div className="flex items-center gap-4">\r\n              {(CONTENT_TABLES.some(t => t.id === activeTab) || activeTab === \'student_submissions\') && (';
const searchAlt = '{(CONTENT_TABLES.some(t => t.id === activeTab) || activeTab === \'student_submissions\') && (';

const idx = code.indexOf(searchAlt);
if (idx !== -1) {
  const insertCode = `
              {CONTENT_TABLES.some(t => t.id === activeTab) && (
                <button
                  type="button"
                  onClick={async () => {
                    const confirmApply = window.confirm(\`Set the new banner.png as default thumbnail for all items in "\${activeTab}" without an image?\`);
                    if (!confirmApply) return;
                    setLoading(true);
                    try {
                      const targets = tableData.filter(item => !item.cover_image && !item.thumbnail && !item.image_url);
                      if (targets.length === 0) {
                        showAlert('All entries already have thumbnails set.', 'info');
                        setLoading(false);
                        return;
                      }
                      for (const target of targets) {
                        const actualTable = (activeTab === 'profiles_edit' || activeTab === 'users') ? 'profiles' : activeTab;
                        await adminSupabase.from(actualTable).update({ cover_image: '/assets/images/img/banner.png' }).eq('id', target.id);
                      }
                      showAlert(\`Applied banner.png to \${targets.length} entries!\`, 'success');
                      fetchTableData(activeTab);
                    } catch (e) {
                      showAlert('Failed to update banner thumbnails: ' + e.message, 'error');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 h-12 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                  title="Apply default banner.png to all entries missing a thumbnail"
                >
                  <Tag size={14} /> Apply Default Banner
                </button>
              )}
`;

  code = code.substring(0, idx) + insertCode + code.substring(idx);
  fs.writeFileSync('src/pages/SevenMod.jsx', code);
  console.log('Successfully added Batch Apply Default Banner button in SevenMod');
} else {
  console.log('Could not find insert position for batch button');
}

