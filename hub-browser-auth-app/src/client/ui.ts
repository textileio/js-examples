import { template } from 'lodash';
import jdenticon from 'jdenticon';

/**
 * Display the identity short string
 */
export const displayIdentity = (publicKey: string) => {
  const shortId = publicKey.substr(publicKey.length - 11, 10)
  const outputElement = document.getElementById('publicKey');
  if (outputElement) {
    var compiled = template(`
      <strong>identity:</strong> <%- shortId %>
    `.trim());
    outputElement.innerHTML = compiled({
      shortId,
    });
  }
}

/**
 * Display an avatar based on the user identity
 */
export const displayAvatar = (identity: string) => {
  const outputElement = document.getElementById('identity');
  if (outputElement) {
    var compiled = template(`
      <svg width="80" height="80" data-jdenticon-value="<%- identity %>"></svg>
    `.trim());
    outputElement.innerHTML = compiled({
      identity,
    });
    /** trigger rendering */
    jdenticon();
  }
}
/**
 * Notify the user that they are verified on the API
 */
export const displayStatus = () => {
  const tokenElement = document.getElementById('token');
  if (tokenElement) {
    tokenElement.classList.add("verified");
  }
  /** Timeout just so the UI changes some after it loads :) */
  setTimeout(()=> {
    const labelElement = document.getElementById('token-label');
    if (labelElement) {
      labelElement.innerHTML = 'API AVAILABLE'
    }
  }, 800)
}

/**
 * Display any user threads created
 */
export const displayThreadsList = (threads: string) => {
  /** Timeout just so the UI changes some after it loads :) */
  setTimeout(() => {
    const threadsElement = document.getElementById('threads-list');
    if (threadsElement) {
      threadsElement.classList.add("verified");
      threadsElement.innerHTML = threads;
    }
  }, 1000)
}
