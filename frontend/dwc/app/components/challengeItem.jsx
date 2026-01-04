import { useState, useEffect } from 'react';
import LinkBarItem from './linkbarItem';

export default function ChallengeItem({ item, onSelect }) {

    function formatDate(inputDate) {
        if (!/^\d{8}$/.test(inputDate)) throw new Error('Invalid date format. Expected YYYYMMDD.');
        const year = parseInt(inputDate.substring(0, 4), 10);
        const month = parseInt(inputDate.substring(4, 6), 10) - 1;
        const day = parseInt(inputDate.substring(6, 8), 10);
        const date = new Date(year, month, day);
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    function calculateWidth(originalHeight, originalWidth, newHeight) {
        const ratio = originalHeight / originalWidth;
        return newHeight * ratio;
    }

    function getUniqueValueForToday() {
        const date = new Date();
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return year + month + day;
    }

    function isCurrentDateMoreRecent(dateString) {
        return Number(dateString) < Number(getUniqueValueForToday());
    }

    if (!isCurrentDateMoreRecent(item.date)) {
        return <div />;
    }

    return (
        <div className="hoverListItem" onClick={() => onSelect(item)} style={{ cursor: 'pointer' }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 18 }}>
                        {formatDate(item.date)} •{' '}
                        <a
                            href={`https://en.wikipedia.org/wiki/${item.answer.replace(/ /g, "_")}`}
                            style={{ textDecoration: 'none' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {item.answer}
                        </a>
                    </h1>
                    {item.category !== undefined ? (
                        <p style={{ fontSize: 14, color: "#828282" }}>
                            Category: <a href={`https://en.wikipedia.org/wiki/${item.category.replace(/ /g, "_")}`} target="_blank" rel="noopener noreferrer">{item.category.replace("Category:", "")}</a>
                        </p>
                    ) : (
                        <p style={{ fontSize: 14, color: "#828282" }}>
                            Categories: 
                            <a href={`https://en.wikipedia.org/wiki/${item.category1.replace(/ /g, "_")}`} target="_blank" rel="noopener noreferrer">{item.category1.replace("Category:", "")}</a>,{' '}
                            <a href={`https://en.wikipedia.org/wiki/${item.category2.replace(/ /g, "_")}`} target="_blank" rel="noopener noreferrer">{item.category2.replace("Category:", "")}</a>,{' '}
                            <a href={`https://en.wikipedia.org/wiki/${item.category3.replace(/ /g, "_")}`} target="_blank" rel="noopener noreferrer">{item.category3.replace("Category:", "")}</a>
                        </p>
                    )}
                </div>
                {item.img_src !== null ? (
                    <img
                        src={item.img_src}
                        alt="Challenge Image"
                        width={calculateWidth(item.img_w, item.img_h, 50)}
                        height={50}
                    />
                ) : null}
            </div>
            <div style={{ backgroundColor: "#F2F2F2" }} className="light-line" />
        </div>
    );
}
