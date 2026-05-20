import React, { useState } from 'react';

const SongTable = ({ songs, onSongClick, selectedSong }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSongs = songs.filter(song => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const title = (song[2] || '').toString().toLowerCase();
    const artist = (song[3] || '').toString().toLowerCase();
    return title.includes(term) || artist.includes(term);
  });

  // If there are too many songs, just show the top 100 to avoid performance issues in rendering
  const displaySongs = filteredSongs.slice(0, 100);

  return (
    <div className="song-table-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '10px 15px', borderBottom: '1px solid #EEEEEE', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="🔍 搜索歌曲名或歌手..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, padding: '8px 12px', 
            border: '1px solid #DDDDDD', borderRadius: '6px', 
            fontSize: '13px', outline: 'none' 
          }}
        />
        {selectedSong && (
          <button 
            onClick={() => onSongClick && onSongClick(null)}
            title="取消图表中的红点高亮"
            style={{
              padding: '0 12px',
              backgroundColor: '#FFF0F0',
              color: '#FF5E7E',
              border: '1px solid #FFD6DE',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              whiteSpace: 'nowrap'
            }}
          >
            ✖ 取消高亮
          </button>
        )}
      </div>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
      <table className="song-table" cellSpacing="0" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>歌曲名</th>
            <th>歌手</th>
            <th>流派</th>
            <th>能量</th>
            <th>愉悦度</th>
          </tr>
        </thead>
        <tbody>
          {displaySongs.map((song, idx) => {
            const isSelected = selectedSong && selectedSong[2] === song[2] && selectedSong[3] === song[3];
            return (
            <tr 
              key={'song-' + idx}
              onClick={() => {
                if (onSongClick) {
                  onSongClick(isSelected ? null : song);
                }
              }}
              style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(168, 216, 185, 0.2)' : 'transparent' }}
            >
              <td style={{color: '#666666'}}>{idx + 1}</td>
              <td className="song-title">{song[2]}</td>
              <td className="song-artist">{song[3]}</td>
              <td style={{color: '#666666'}}><span style={{
                backgroundColor: '#F4F6F8', 
                padding: '2px 8px', 
                borderRadius: '10px',
                fontSize: '11px',
                color: '#333333'
              }}>{song[4]}</span></td>
              <td style={{color: '#88B04B'}}>{song[0].toFixed(2)}</td>
              <td style={{color: '#88B04B'}}>{song[1].toFixed(2)}</td>
            </tr>
            );
          })}
          {filteredSongs.length > 100 && (
            <tr>
              <td colSpan="6" style={{textAlign: 'center', color: '#666666', fontStyle: 'italic', paddingTop: '16px'}}>
                ... 以及其他 {filteredSongs.length - 100} 首匹配歌曲（请提供更精确的搜索词）。
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default SongTable;
